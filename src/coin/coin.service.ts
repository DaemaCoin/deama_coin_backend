import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeminiUtilService } from 'src/util-module/gemini/gemini.service';
import { GithubService } from 'src/github/github.service';
import { CoinEntity } from './entity/coin.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { WalletService } from 'src/wallet/wallet.service';
import { RedisUtilService } from 'src/util-module/redis/redis-util.service';
import { formattedDate, generateToday } from 'src/common/util/date-fn';

@Injectable()
export class CoinService {
  private readonly CACHE_TTL = 3600; // 1시간 (초 단위)
  private readonly CACHE_PREFIX = 'coin_history:';

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
    const MAX_COIN_AMOUNT = 20;
    
    // 날짜는 한 번만 계산
    const today = generateToday();
    
    for (const commitId of commitIds) {
      let user: UserEntity | null = null;
      let commitData: any;
      let actualCoinAmount = 0;
      try {
        // Push된 커밋 Id들 중 하나의 Diff를 구함
        commitData = await this.githubService.getCommitData(
          fullName,
          commitId,
        );

        // 그 하나의 내용을 reward 점수로써 표현
        const commitPatchDatas: string[] = commitData.files.map( (v) => v.patch );
        const commitScore = await this.geminiService.getCommitScore(
          commitPatchDatas.join(', '),
        );

        // 유저 정보 조회 (락 없이)
        user = await this.userRepository.findOne({ where: { githubId: commitData.author.login } });
        if (!user) {
          throw new UserNotFoundException();
        }

        const lastCoinDate = formattedDate(user.lastCoinDate, 'yyyy-MM-dd');
        if (!lastCoinDate || lastCoinDate !== today) {
          user.dailyCoinAmount = 0;
        }

        // 남은 코인 계산
        const remainingCoins = MAX_COIN_AMOUNT - user.dailyCoinAmount;
        actualCoinAmount = Math.min(commitScore, remainingCoins);

        // 1. 외부 API 먼저 호출
        await this.walletService.postReward(user.id, commitData.sha, actualCoinAmount);

        // 2. 외부 API 성공 시에만 트랜잭션 시작 및 DB 저장
        const queryRunner = this.userRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        await queryRunner.query('SET SESSION innodb_lock_wait_timeout = 30');

        try {
          // 락을 걸고 유저 정보 재조회 (동일 트랜잭션 내에서)
          const lockedUser = await queryRunner.manager.findOne(UserEntity, {
            where: { githubId: commitData.author.login },
            lock: { mode: 'pessimistic_write' }
          });
          if (!lockedUser) {
            throw new UserNotFoundException();
          }

          const lockedLastCoinDate = formattedDate(lockedUser.lastCoinDate, 'yyyy-MM-dd');
          if (!lockedLastCoinDate || lockedLastCoinDate !== today) {
            await queryRunner.manager.update(UserEntity, lockedUser.id, {
              dailyCoinAmount: 0,
              lastCoinDate: today
            });
            lockedUser.dailyCoinAmount = 0;
          }

          const lockedRemainingCoins = MAX_COIN_AMOUNT - lockedUser.dailyCoinAmount;
          const lockedActualCoinAmount = Math.min(commitScore, lockedRemainingCoins);

          await this.coinRepository.save({
            id: commitData.sha,
            amount: lockedActualCoinAmount,
            message: commitData.commit.message,
            repoName: fullName,
            user: { id: lockedUser.id },
          });

          await queryRunner.manager.update(UserEntity, lockedUser.id, {
            totalCommits: lockedUser.totalCommits + 1,
            dailyCoinAmount: lockedUser.dailyCoinAmount + lockedActualCoinAmount
          });

          await queryRunner.commitTransaction();

          // 새로운 코인이 추가되었으므로 해당 사용자의 모든 페이지 캐시 삭제
          await this._clearUserCache(lockedUser.id, '새로운 코인 추가 후');
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error(`커밋 처리 중 오류 발생 (커밋 ID: ${commitId}, 사용자: ${commitData.author.login}): ${error.message}`);
          throw error;
        } finally {
          await queryRunner.release();
        }
      } catch (error) {
        console.error(`커밋 ID ${commitId} 처리 중 오류 발생: ${error.message}`);
        throw error;
      }
    }
  }

  async getCoinHistory(userId: string, page: number = 0) {
    const take = 20;
    const cacheKey = `${this.CACHE_PREFIX}${userId}:${page}`;

    try {
      // 캐시에서 데이터 조회 시도
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        try {
          return JSON.parse(cachedData);
        } catch (parseError) {
          await this._clearCache(cacheKey, '잘못된 캐시 데이터');
        }
      }

      // 캐시에 없거나 파싱 실패 시 DB에서 조회
      const history = await this._fetchCoinHistoryFromDB(userId, page, take);
      const result = { history };

      // 결과를 캐시에 저장 (1시간 TTL)
      const cacheSuccess = await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
      if (!cacheSuccess) {
        await this._clearCache(cacheKey, '캐시 저장 실패');
      }

      return result;
    } catch (error) {
      console.error(`코인 내역 조회 중 오류 발생 (사용자 ID: ${userId}, 페이지: ${page}): ${error.message}`);
      // Redis 오류가 발생해도 DB에서 데이터는 반환
      const history = await this._fetchCoinHistoryFromDB(userId, page, take);
      await this._clearCache(cacheKey, '오류 발생');
      return { history };
    }
  }

  private async _fetchCoinHistoryFromDB(userId: string, page: number, take: number): Promise<CoinEntity[]> {
    return this.coinRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: page * take,
      take,
    });
  }

  private async _clearCache(key: string, errorMessage?: string): Promise<void> {
    try {
      await this.redisService.delete(key);
    } catch (error) {
      console.error(`캐시 삭제 실패 (키: ${key})${errorMessage ? ` - 사유: ${errorMessage}` : ''}: ${error.message}`);
    }
  }

  private async _clearUserCache(userId: string, errorMessage?: string): Promise<boolean> {
    const cachePattern = `${this.CACHE_PREFIX}${userId}:*`;
    try {
      return await this.redisService.deleteByPattern(cachePattern);
    } catch (error) {
      console.error(`사용자 캐시 삭제 실패 (사용자 ID: ${userId})${errorMessage ? ` - 사유: ${errorMessage}` : ''}: ${error.message}`);
      return false;
    }
  }
}