import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinEntity, CoinType } from './entity/coin.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { GithubService } from 'src/github/github.service';
import { GeminiUtilService } from 'src/util-module/gemini/gemini.service';
import { WalletService } from 'src/wallet/wallet.service';
import { RedisUtilService } from 'src/util-module/redis/redis-util.service';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { formattedDate, generateToday, getCurrentKoreanTime, getTodayStartEnd } from 'src/common/util/date-fn';
import { AlreadyCoinExistException } from 'src/exception/custom-exception/already-coin-exist.exception';
import { InsufficientBalanceException } from 'src/exception/custom-exception/insufficient-balance.exception';
import { TransferRequest } from 'src/common/util/transfer.request.dto';

@Injectable()
export class CoinService {
  private readonly CACHE_TTL = 3600;
  private readonly CACHE_PREFIX = 'coin_history:';
  private readonly TODAY_MINED_CACHE_PREFIX = 'today_mined_coins:';
  private readonly MAX_COIN_AMOUNT = 20;
  private readonly PAGE_SIZE = 20;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly githubService: GithubService,
    private readonly geminiService: GeminiUtilService,
    private readonly walletService: WalletService,
    private readonly redisService: RedisUtilService,
  ) {}

  async commitHook(fullName: string, commitIds: string[]) {
    const today = generateToday();

    const results = await Promise.allSettled(
      commitIds.map((commitId) => this._processCommit(fullName, commitId, today)),
    );

    const failedCommits = results
      .map((res, i) => (res.status === 'rejected' ? commitIds[i] : null))
      .filter((v): v is string => v !== null);

    if (failedCommits.length > 0) {
      console.warn(`일부 커밋 처리 실패: ${failedCommits.join(', ')}`);
    }
  }

  private async _processCommit(fullName: string, commitId: string, today: string) {
    try {
      const commitData = await this.githubService.getCommitData(fullName, commitId);

      const coin = await this.coinRepository.findOne({
        where: { id: commitData.sha },
      });
      if (coin) throw new AlreadyCoinExistException();

      const commitPatch = commitData.files.map((file) => file.patch).join(', ');
      const commitScore = await this.geminiService.getCommitScore(commitPatch);
  
      const user = await this._findUserByGithubId(commitData.author.login);
      const actualCoinAmount = this._calculateCoinAmount(user, commitScore, today);
  
      await this.walletService.postReward(user.id, commitData.sha, actualCoinAmount);
  
      await this.coinRepository.save({
        id: commitData.sha,
        amount: actualCoinAmount,
        message: commitData.commit.message,
        repoName: fullName,
        type: CoinType.MINING,
        createdAt: getCurrentKoreanTime(),
        user: { id: user.id },
      });
  
      await this._updateUserCoinInfo(user, actualCoinAmount, today);

      try {
        const cachePattern = `${this.CACHE_PREFIX}${user.id}:*`;
        await this.redisService.deleteByPattern(cachePattern);

        const todayMinedCacheKey = `${this.TODAY_MINED_CACHE_PREFIX}${user.id}:${today}`;
        await this.redisService.delete(todayMinedCacheKey);
      } catch (error) {
        console.error(`캐시 삭제 실패 (userId: ${user.id}): ${error.message}`);
        // 캐시 삭제 실패는 치명적이지 않으므로 로그만 기록하고 계속 진행
      }
    } catch (error) {
      console.error(`커밋 처리 실패 (commitId: ${commitId}): ${error.message}`);
      throw error; // Promise.allSettled에서 처리할 수 있도록 re-throw
    }
  }

  private async _findUserByGithubId(githubId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { githubId } });
    if (!user) throw new UserNotFoundException();
    return user;
  }

  private _calculateCoinAmount(user: UserEntity, commitScore: number, today: string): number {
    const lastCoinDate = formattedDate(user.lastCoinDate, 'yyyy-MM-dd');
    if (!lastCoinDate || lastCoinDate !== today) {
      user.dailyCoinAmount = 0;
      user.lastCoinDate = new Date(today);
    }
    const remaining = this.MAX_COIN_AMOUNT - user.dailyCoinAmount;
    return Math.min(commitScore, remaining);
  }

  private async _updateUserCoinInfo(user: UserEntity, coinAmount: number, today: string) {
    try {
      await this.userRepository.update(user.id, {
        totalCommits: user.totalCommits + 1,
        dailyCoinAmount: user.dailyCoinAmount + coinAmount,
        lastCoinDate: user.lastCoinDate,
      });
    } catch (error) {
      console.error(`사용자 정보 업데이트 실패 (userId: ${user.id}): ${error.message}`);
      throw error;
    }
  }

  async getCoinHistory(userId: string, page: number = 0) {
    const cacheKey = `${this.CACHE_PREFIX}${userId}:${page}`;

    try {
      const cached = await this.redisService.getJson(cacheKey);
      if (cached) return cached;

      const history = await this._fetchCoinHistoryFromDB(userId, page);
      const result = { history };

      await this.redisService.setJson(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error(`코인 히스토리 조회 실패 (userId: ${userId}, page: ${page}): ${error.message}`);
      // 캐시 실패 시에도 DB에서 데이터는 반환
      const history = await this._fetchCoinHistoryFromDB(userId, page);
      return { history };
    }
  }

  private async _fetchCoinHistoryFromDB(userId: string, page: number): Promise<CoinEntity[]> {
    try {
      return await this.coinRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        skip: page * this.PAGE_SIZE,
        take: this.PAGE_SIZE,
      });
    } catch (error) {
      console.error(`DB에서 코인 히스토리 조회 실패 (userId: ${userId}, page: ${page}): ${error.message}`);
      throw error;
    }
  }

  async getTodayMinedCoins(userId: string) {
    const { start, end } = getTodayStartEnd();
    const today = generateToday();
    const cacheKey = `${this.TODAY_MINED_CACHE_PREFIX}${userId}:${today}`;

    try {
      const cached = await this.redisService.getJson<{ totalAmount: number }>(cacheKey);
      if (cached) return cached;

      const totalAmount = await this._getTodayCoinsFromDB(userId, start, end);
      const result = { totalAmount };

      await this.redisService.setJson(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error(`오늘 채굴된 코인 개수 조회 실패 (userId: ${userId}): ${error.message}`);
      // 캐시 실패 시에도 DB에서 데이터는 반환
      const totalAmount = await this._getTodayCoinsFromDB(userId, start, end);
      return { totalAmount };
    }
  }

  private async _getTodayCoinsFromDB(userId: string, start: Date, end: Date): Promise<number> {
    try {
      const todayCoins = await this.coinRepository
        .createQueryBuilder('coin')
        .select('SUM(coin.amount)', 'totalAmount')
        .where('coin.userId = :userId', { userId })
        .andWhere('coin.createdAt BETWEEN :start AND :end', { start, end })
        .andWhere('coin.type = :type', { type: CoinType.MINING })
        .getRawOne();

      return Number(todayCoins?.totalAmount || 0);
    } catch (error) {
      console.error(`DB에서 오늘 채굴된 코인 개수 조회 실패 (userId: ${userId}): ${error.message}`);
      throw error;
    }
  }

  private async _recordTransfer(fromUserId: string, toUserId: string, amount: number) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    
    for (let retryCount = 0; retryCount < MAX_RETRIES; retryCount++) {
      const queryRunner = this.coinRepository.manager.connection.createQueryRunner();
      
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        const transferHash = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        
        // 송금자 기록 (음수로 저장)
        await queryRunner.manager.save(CoinEntity, {
          id: `${transferHash}_from`,
          amount: -amount, // 송금은 음수로 기록
          message: `${toUserId}에게 ${amount} 코인 이체`,
          repoName: 'Transfer',
          type: CoinType.TRANSFER,
          createdAt: getCurrentKoreanTime(),
          user: { id: fromUserId },
        });

        // 수신자 기록 (양수로 저장)
        await queryRunner.manager.save(CoinEntity, {
          id: `${transferHash}_to`,
          amount: amount, // 수신은 양수로 기록
          message: `${fromUserId}로부터 ${amount} 코인 수신`,
          repoName: 'Transfer',
          type: CoinType.TRANSFER,
          createdAt: getCurrentKoreanTime(),
          user: { id: toUserId },
        });

        await queryRunner.commitTransaction();
        
        // 트랜잭션 성공 후 캐시 무효화
        await Promise.all([
          this.redisService.deleteByPattern(`${this.CACHE_PREFIX}${fromUserId}:*`),
          this.redisService.deleteByPattern(`${this.CACHE_PREFIX}${toUserId}:*`),
        ]);

        console.log(`이체 기록 저장 완료 (from: ${fromUserId}, to: ${toUserId}, amount: ${amount})`);
        return; // 성공 시 함수 종료
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (retryCount < MAX_RETRIES - 1) {
          console.warn(`이체 기록 저장 실패, ${retryCount + 1}번째 재시도... (from: ${fromUserId}, to: ${toUserId}, amount: ${amount}): ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        } else {
          console.error(`이체 기록 저장 최종 실패 (from: ${fromUserId}, to: ${toUserId}, amount: ${amount}): ${error.message}`);
          throw error;
        }
      } finally {
        await queryRunner.release();
      }
    }
  }

  async transfer(fromUserId: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    try {
      // 수신자 존재 확인
      const toUser = await this.userRepository.findOne({ where: { id: to } });
      if (!toUser) throw new UserNotFoundException();

      // 계좌 잔액 확인
      const fromUserBalance = await this.walletService.getWallet(fromUserId);
      if(fromUserBalance.balance < amount) throw new InsufficientBalanceException();

      // WalletService를 통해 실제 이체 수행
      const result = await this.walletService.transfer(fromUserId, transferRequest);

      // 이체 기록을 coinRepository에 저장
      await this._recordTransfer(fromUserId, to, Number(amount));

      return result;
    } catch (error) {
      console.error(`코인 이체 실패 (from: ${fromUserId}, to: ${to}, amount: ${amount}): ${error.message}`);
      throw error;
    }
  }
}
