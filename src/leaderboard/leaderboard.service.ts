import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entity/user.entity';
import {
  LeaderboardResponseDto,
  LeaderboardItemDto,
} from './dto/leaderboard.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletService } from 'src/wallet/wallet.service';
import { RedisUtilService } from 'src/util-module/redis/redis-util.service';
import { LeaderBoardNotCachedException } from 'src/exception/custom-exception/leader-board-not-cached.exception';

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private readonly LEADERBOARD_CACHE_KEY = 'leaderboard:data';
  private readonly LEADERBOARD_CACHE_TTL = 60 * 5;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly walletService: WalletService,
    private readonly redisService: RedisUtilService,
  ) {}

  onModuleInit() {
    this.cacheWalletLeaderboard();
  }

  @Cron('*/3 * * * *')
  async cacheWalletLeaderboard(): Promise<void> {
    try {
      const users = await this.userRepository.find();

      const leaderboard = await Promise.allSettled(
        users.map(async (user) => {
          try {
            const wallet = await this.walletService.getWallet(user.id);
            return {
              userId: user.id,
              githubId: user.githubId,
              profileImageUrl: user.githubImageUrl,
              totalCoins: wallet.balance,
            };
          } catch (err) {
            console.warn(`지갑 조회 실패 - ${user.id}: ${err.message}`);
            return null;
          }
        }),
      );

      const filtered = leaderboard.filter((u) => u.status == 'fulfilled');

      const ranked = filtered
        .sort((a: any, b: any) => b.totalCoins - a.totalCoins)
        .map((fulfilledValue, index) => ({
          ...fulfilledValue.value,
          rank: index + 1,
        }));

      await this.redisService.setJson(
        this.LEADERBOARD_CACHE_KEY,
        ranked,
        this.LEADERBOARD_CACHE_TTL,
      );

      console.log(`리더보드 캐시 갱신 완료 (총 ${ranked.length}명)`);
    } catch (error) {
      console.error(`리더보드 캐시 갱신 실패: ${error.message}`);
    }
  }

  async getLeaderboard(
  ): Promise<LeaderboardResponseDto> {
    const cached = await this.redisService.getJson<LeaderboardItemDto[]>(this.LEADERBOARD_CACHE_KEY);
    if (!cached) {
      this.cacheWalletLeaderboard();
      throw new LeaderBoardNotCachedException();
    }

    return { items: cached };
  }
}
