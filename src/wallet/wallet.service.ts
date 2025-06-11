import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { CreateWalletException } from 'src/exception/custom-exception/create-wallet.exception';
import { GetWalletException } from 'src/exception/custom-exception/get-wallet.exception';
import { TransferRequest } from './dto/request/transfer.request';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { Repository } from 'typeorm';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { TransferCoinException } from 'src/exception/custom-exception/transfer-coin.exception';
import { GenerativeModel } from '@google/generative-ai';
import { GithubService } from 'src/auth/github.service';
import { CoinEntity } from './entity/commit.entity';
import { GetRewardScoreException } from 'src/exception/custom-exception/get-reward-score.exception';

@Injectable()
export class WalletService {
  private readonly bcServerUrl: string;
  private readonly xApiKey: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly geminiModel: GenerativeModel,
    private readonly configService: ConfigService,
    private readonly githubSerivice: GithubService,
  ) {
    this.bcServerUrl = this.configService.get(EnvKeys.DEAMA_COIN_BC_SERVER_URL);
    this.xApiKey = this.configService.get(EnvKeys.X_API_Key);
  }

  async createWallet(owner: string, initialBalance: number) {
    const res = await fetch(`${this.bcServerUrl}/api/wallet`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.xApiKey,
      },
      body: JSON.stringify({
        owner: owner,
        initialBalance,
      }),
    });

    const encodedId = Buffer.from(owner).toString('base64');
    await this.coinRepository.save({
      id: encodedId,
      message: '초기 코인 지급',
      repoName: 'Start',
      user: { id: owner },
      amount: initialBalance,
    });

    const data = await res.json();

    if (res.status == 202) {
      return data;
    } else {
      throw new CreateWalletException(JSON.stringify(data));
    }
  }

  async getWallet(owner: string) {
    const res = await fetch(`${this.bcServerUrl}/api/wallet/${owner}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.xApiKey,
      },
    });

    const data = await res.json();

    if (res.status == 200) {
      return data;
    } else {
      throw new GetWalletException(JSON.stringify(data), res.status);
    }
  }

  async transfer(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    const toUser = await this.userRepository.findOne({ where: { id: to } });
    if (!toUser) throw new UserNotFoundException();

    const res = await fetch(`${this.bcServerUrl}/api/wallet/transfer`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.xApiKey,
      },
      body: JSON.stringify({
        from: owner,
        to,
        amount,
      }),
    });

    const data = await res.json();

    if (res.status == 202) {
      return data;
    } else {
      throw new TransferCoinException(JSON.stringify(data));
    }
  }

  async transferAnoymous(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    const res = await fetch(`${this.bcServerUrl}/api/wallet/transfer`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.xApiKey,
      },
      body: JSON.stringify({
        from: owner,
        to,
        amount,
      }),
    });

    const data = await res.json();

    if (res.status == 202) {
      return data;
    } else {
      throw new TransferCoinException(JSON.stringify(data));
    }
  }

  async commitHook(fullName: string, commitIds: string[]) {
    const results = await Promise.allSettled(
      commitIds.map(async (commitId) => {
        try {
          // Push된 커밋 Id들 중 하나의 Diff를 구함
          const commitData = await this.githubSerivice.getCommitData(
            fullName,
            commitId,
          );

          // 그 하나의 내용을 reward 점수로써 표현
          const commitPatchDatas: string[] = commitData.files.map(
            (v) => v.patch,
          );
          const commitScore = await this.getRewardScore(
            commitPatchDatas.join(', '),
          );

          // commitData.author.name으로 유저를 찾아서 해당 유저의 XQARE ID 찾기
          const user = await this.userRepository.findOne({
            where: { githubId: commitData.author.login },
          });
          if (!user) throw new UserNotFoundException();

          // 표현된 점수를 블록체인 서버에 보내기
          await this.postReward(user.id, commitData.sha, commitScore);

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

  async getRewardScore(commitContent: string): Promise<number> {
    try {
      const result = await this.geminiModel.generateContent(
        `커밋 내용 : ${commitContent}`,
      );
      const response = result.response;
      return Number(response.text().trim());
    } catch (error) {
      console.error('Gemini reward 기능 호출 중 오류 발생:', error);
      throw new GetRewardScoreException();
    }
  }

  async postReward(owner: string, commitHash: string, commitScore: number) {
    const res = await fetch(`${this.bcServerUrl}/api/wallet/reward`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.xApiKey,
      },
      body: JSON.stringify({
        owner,
        commitHash,
        amount: commitScore,
      }),
    });

    const data = await res.json();

    if (res.status == 202) {
      return data;
    } else {
      throw new CreateWalletException(JSON.stringify(data));
    }
  }

  async getCoinHistory(userId: string, page: number = 0) {
    const take = 20;

    return {
      history: await this.coinRepository.find({
        where: { user: { id: userId } },
        skip: page * take,
        take
      }),
    };
  }
}
