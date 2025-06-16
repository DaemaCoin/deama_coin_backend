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
    const currentDate = new Date();
    const today = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
   
    const results = await Promise.allSettled(
      commitIds.map(async (commitId) => {
        try {
          // Push된 커밋 Id들 중 하나의 Diff를 구함
          const commitData = await this.githubService.getCommitData(
            fullName,
            commitId,
          );

          // 그 하나의 내용을 reward 점수로써 표현
          const commitPatchDatas: string[] = commitData.files.map(
            (v) => v.patch,
          );
          const commitScore = await this.geminiService.getCommitScore(
            commitPatchDatas.join(', '),
          );

          // 트랜잭션 시작
          const queryRunner = this.userRepository.manager.connection.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            // 락을 걸고 유저 정보 조회 (한 번에 처리)
            const user = await queryRunner.manager.findOne(UserEntity, {
              where: { githubId: commitData.author.login },
              lock: { mode: 'pessimistic_write' }
            });

            if (!user) {
              await queryRunner.rollbackTransaction();
              throw new UserNotFoundException();
            }

            const lastCoinDate = user.lastCoinDate ? 
              new Date(Date.UTC(user.lastCoinDate.getUTCFullYear(), user.lastCoinDate.getUTCMonth(), user.lastCoinDate.getUTCDate())) : 
              null;

            if (!lastCoinDate || lastCoinDate.getTime() !== today.getTime()) {
              // 새로운 날짜인 경우 일일 코인 획득량 초기화
              await queryRunner.manager.update(UserEntity, user.id, {
                dailyCoinAmount: 0,
                lastCoinDate: today
              });
              user.dailyCoinAmount = 0;
            }

            // 일일 제한 체크
            if (user.dailyCoinAmount >= MAX_COIN_AMOUNT) {
              console.log(`User ${user.id} has reached daily coin limit`);
              await queryRunner.rollbackTransaction();
              return;
            }

            // 남은 코인 계산
            const remainingCoins = MAX_COIN_AMOUNT - user.dailyCoinAmount;
            const actualCoinAmount = Math.min(commitScore, remainingCoins);

            // 표현된 점수를 블록체인 서버에 보내기
            await this.walletService.postReward(user.id, commitData.sha, actualCoinAmount);

            await this.coinRepository.save({
              id: commitData.sha,
              amount: actualCoinAmount,
              message: commitData.commit.message,
              repoName: fullName,
              user: { id: user.id },
            });

            await queryRunner.manager.update(UserEntity, user.id, {
              totalCommits: user.totalCommits + 1,
              dailyCoinAmount: user.dailyCoinAmount + actualCoinAmount
            });

            await queryRunner.commitTransaction();

            // 새로운 코인이 추가되었으므로 해당 사용자의 모든 페이지 캐시 삭제
            const cachePattern = `${this.CACHE_PREFIX}${user.id}:*`;
            const cacheDeleteSuccess = await this.redisService.deleteByPattern(cachePattern);
            if (!cacheDeleteSuccess) {
              console.warn(`Failed to delete cache for user ${user.id} after new coin addition`);
            }
          } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`Error processing commit ${commitId} for user ${commitData.author.login}:`, error);
            throw error;
          } finally {
            await queryRunner.release();
          }
        } catch (error) {
          console.error(`Error processing commitId ${commitId}:`, error);
          throw error;
        }
      }),
    );

    // 전체 결과를 리턴하거나, 실패한 커밋 ID를 모아서 후처리 가능
    const failedCommits = results
      .map((res, i) => (res.status === 'rejected' ? commitIds[i] : null))
      .filter((v): v is string => v !== null);

    if (failedCommits.length > 0) {
      console.warn(
        `Some commits failed to process: ${failedCommits.join(', ')}`,
      );
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
          console.error(`Failed to parse cached data for key ${cacheKey}: ${parseError.message}`);
          // 파싱 실패 시 캐시 삭제
          await this.redisService.delete(cacheKey);
        }
      }

      // 캐시에 없거나 파싱 실패 시 DB에서 조회
      const history = await this._fetchCoinHistoryFromDB(userId, page, take);
      const result = { history };

      // 결과를 캐시에 저장 (1시간 TTL)
      const cacheSuccess = await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
      if (!cacheSuccess) {
        console.warn(`Failed to cache coin history for user ${userId} page ${page}`);
      }

      return result;
    } catch (error) {
      console.error(`Error in getCoinHistory for user ${userId} page ${page}: ${error.message}`);
      // Redis 오류가 발생해도 DB에서 데이터는 반환
      const history = await this._fetchCoinHistoryFromDB(userId, page, take);
      return { history };
    }
  }
}