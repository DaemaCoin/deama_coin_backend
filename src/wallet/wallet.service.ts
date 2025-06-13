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
import { CoinEntity } from '../coin/entity/coin.entity';

@Injectable()
export class WalletService {
  private readonly bcServerUrl: string;
  private readonly xApiKey: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly configService: ConfigService,
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
}
