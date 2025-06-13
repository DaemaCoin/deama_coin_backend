import { Injectable } from '@nestjs/common';
import { TransferRequest } from './dto/request/transfer.request';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { Repository } from 'typeorm';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { CoinEntity } from '../coin/entity/coin.entity';
import { BlockchainClient } from './block-chain-client';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly bcClient: BlockchainClient,
  ) {}

  async createWallet(owner: string, initialBalance: number) {
    await this.bcClient.fetch<any>('/api/wallet', 202, {
      method: 'POST',
      body: JSON.stringify({
        owner,
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
  }

  async getWallet(owner: string) {
    return await this.bcClient.fetch<any>(`/api/wallet/${owner}`, 200, {
      method: 'GET',
    });
  }

  async transfer(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    const toUser = await this.userRepository.findOne({ where: { id: to } });
    if (!toUser) throw new UserNotFoundException();

    return await this.bcClient.fetch<any>(`/api/wallet/transfer`, 202, {
      method: 'POST',
      body: JSON.stringify({
        from: owner,
        to,
        amount,
      }),
    });
  }

  async transferAnonymous(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    return await this.bcClient.fetch<any>(`/api/wallet/transfer`, 202, {
      method: 'POST',
      body: JSON.stringify({
        from: owner,
        to,
        amount,
      }),
    });
  }

  async postReward(owner: string, commitHash: string, commitScore: number) {
    return await this.bcClient.fetch<any>(`/api/wallet/reward`, 202, {
      method: 'POST',
      body: JSON.stringify({
        owner,
        commitHash,
        amount: commitScore,
      }),
    });
  }
}
