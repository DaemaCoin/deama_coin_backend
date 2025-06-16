import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeminiUtilService } from 'src/util-module/gemini/gemini.service';
import { GithubService } from 'src/github/github.service';
import { CoinEntity } from './entity/coin.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { WalletService } from 'src/wallet/wallet.service';
import { QueryRunner } from 'typeorm';

@Injectable()
export class CoinService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly githubService: GithubService,
    private readonly geminiService: GeminiUtilService,
    private readonly walletService: WalletService,
  ) {}

  async commitHook(fullName: string, commitIds: string[]) {
    const MAX_COIN_AMOUNT = 20;
  
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

          // commitData.author.name으로 유저를 찾아서 해당 유저의 XQARE ID 찾기
          const user = await this.userRepository.findOne({
            where: { githubId: commitData.author.login },
          });
          if (!user) throw new UserNotFoundException();

          // 일일 코인 획득량 체크 및 초기화
          const currentDate = new Date();
          const today = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
          
          // 트랜잭션 시작
          const queryRunner = this.userRepository.manager.connection.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            // 락을 걸고 유저 정보 다시 조회
            const lockedUser = await queryRunner.manager.findOne(UserEntity, {
              where: { id: user.id },
              lock: { mode: 'pessimistic_write' }
            });

            if (!lockedUser) {
              throw new UserNotFoundException();
            }

            const lastCoinDate = lockedUser.lastCoinDate ? 
              new Date(Date.UTC(lockedUser.lastCoinDate.getUTCFullYear(), lockedUser.lastCoinDate.getUTCMonth(), lockedUser.lastCoinDate.getUTCDate())) : 
              null;

            if (!lastCoinDate || lastCoinDate.getTime() !== today.getTime()) {
              // 새로운 날짜인 경우 일일 코인 획득량 초기화
              await queryRunner.manager.update(UserEntity, lockedUser.id, {
                dailyCoinAmount: 0,
                lastCoinDate: today
              });
              lockedUser.dailyCoinAmount = 0;
            }

            // 일일 제한 체크
            if (lockedUser.dailyCoinAmount >= MAX_COIN_AMOUNT) {
              console.log(`User ${lockedUser.id} has reached daily coin limit`);
              await queryRunner.rollbackTransaction();
              return;
            }

            // 남은 코인 계산
            const remainingCoins = MAX_COIN_AMOUNT - lockedUser.dailyCoinAmount;
            const actualCoinAmount = Math.min(commitScore, remainingCoins);

            // 표현된 점수를 블록체인 서버에 보내기
            await this.walletService.postReward(lockedUser.id, commitData.sha, actualCoinAmount);

            await this.coinRepository.save({
              id: commitData.sha,
              amount: actualCoinAmount,
              message: commitData.commit.message,
              repoName: fullName,
              user: { id: lockedUser.id },
            });

            await queryRunner.manager.update(UserEntity, lockedUser.id, {
              totalCommits: lockedUser.totalCommits + 1,
              dailyCoinAmount: lockedUser.dailyCoinAmount + actualCoinAmount
            });

            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`Error processing commit ${commitId} for user ${user.id}:`, error);
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

  async getCoinHistory(userId: string, page: number = 0) {
    const take = 20;

    return {
      history: await this.coinRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        skip: page * take,
        take,
      }),
    };
  }
}