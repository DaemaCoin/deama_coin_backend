import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { Repository } from 'typeorm';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { CoinEntity } from '../coin/entity/coin.entity';
import { BlockchainClient } from './block-chain-client';
import { RedisUtilService } from 'src/util-module/redis/redis-util.service';
import { TransferRequest } from 'src/common/util/transfer.request.dto';

@Injectable()
export class WalletService {
  private readonly WALLET_CACHE_PREFIX = 'wallet:';
  private readonly WALLET_CACHE_TTL = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
    private readonly bcClient: BlockchainClient,
    private readonly redisService: RedisUtilService,
  ) {}

  async createWallet(owner: string, initialBalance: number) {
    try {
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

      // 지갑 생성 후 캐시 무효화
      const cacheKey = `${this.WALLET_CACHE_PREFIX}${owner}`;
      await this.redisService.delete(cacheKey);
    } catch (error) {
      console.error(`지갑 생성 실패 (owner: ${owner}): ${error.message}`);
      throw error;
    }
  }

  async getWallet(owner: string): Promise<{ owner: string; balance: number }> {
    const cacheKey = `${this.WALLET_CACHE_PREFIX}${owner}`;

    try {
      // Redis에서 캐시 조회 (RedisUtilService의 getJson 사용)
      const cachedWallet = await this.redisService.getJson<any>(cacheKey);
      if (cachedWallet) return cachedWallet;

      // 캐시에 없으면 Blockchain 서버에서 조회
      const wallet = await this.bcClient.fetch<any>(
        `/api/wallet/${owner}`,
        200,
        {
          method: 'GET',
        },
      );

      // Redis에 저장 (RedisUtilService의 setJson 사용)
      await this.redisService.setJson(cacheKey, wallet, this.WALLET_CACHE_TTL);

      return wallet;
    } catch (error) {
      console.error(`지갑 조회 실패 (owner: ${owner}): ${error.message}`);
      throw error;
    }
  }

  async transfer(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    try {
      const toUser = await this.userRepository.findOne({ where: { id: to } });
      if (!toUser) throw new UserNotFoundException();

      const result = await this.bcClient.fetch<any>(
        `/api/wallet/transfer`,
        202,
        {
          method: 'POST',
          body: JSON.stringify({
            from: owner,
            to,
            amount,
          }),
        },
      );

      // 이체 후 관련 지갑들의 캐시 무효화
      await Promise.all([
        this.redisService.delete(`${this.WALLET_CACHE_PREFIX}${owner}`),
        this.redisService.delete(`${this.WALLET_CACHE_PREFIX}${to}`),
      ]);

      return result;
    } catch (error) {
      console.error(
        `지갑 이체 실패 (from: ${owner}, to: ${to}, amount: ${amount}): ${error.message}`,
      );
      throw error;
    }
  }

  async transferAnonymous(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    try {
      const result = await this.bcClient.fetch<any>(
        `/api/wallet/transfer`,
        202,
        {
          method: 'POST',
          body: JSON.stringify({
            from: owner,
            to,
            amount,
          }),
        },
      );

      // 익명 이체 후 관련 지갑들의 캐시 무효화
      await Promise.all([
        this.redisService.delete(`${this.WALLET_CACHE_PREFIX}${owner}`),
        this.redisService.delete(`${this.WALLET_CACHE_PREFIX}${to}`),
      ]);

      return result;
    } catch (error) {
      console.error(
        `익명 지갑 이체 실패 (from: ${owner}, to: ${to}, amount: ${amount}): ${error.message}`,
      );
      throw error;
    }
  }

  async postReward(owner: string, commitHash: string, commitScore: number) {
    try {
      const result = await this.bcClient.fetch<any>(`/api/wallet/reward`, 202, {
        method: 'POST',
        body: JSON.stringify({
          owner,
          commitHash,
          amount: commitScore,
        }),
      });

      // 보상 지급 후 지갑 캐시 무효화
      await this.redisService.delete(`${this.WALLET_CACHE_PREFIX}${owner}`);

      return result;
    } catch (error) {
      console.error(
        `보상 지급 실패 (owner: ${owner}, commitHash: ${commitHash}, amount: ${commitScore}): ${error.message}`,
      );
      throw error;
    }
  }
}
