import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeminiService } from 'src/gemini/gemini.service';
import { GithubService } from 'src/github/github.service';
import { CoinEntity } from './entity/coin.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class CoinService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly githubService: GithubService,
    private readonly geminiService: GeminiService,
    private readonly walletService: WalletService,
  ) {}

  async commitHook(fullName: string, commitIds: string[]) {
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

          // 표현된 점수를 블록체인 서버에 보내기
          await this.walletService.postReward(user.id, commitData.sha, commitScore);

          await this.coinRepository.save({
            id: commitData.sha,
            amount: commitScore,
            message: commitData.commit.message,
            repoName: fullName,
            user: { id: user.id },
          });

          await this.userRepository.update(user.id, {
            totalCommits: user.totalCommits + 1,
          });
        } catch (error) {
          // 에러 발생 시 로그 수집
          console.error(`Error processing commitId ${commitId}:`, error);
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
