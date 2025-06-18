import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { UserEntity } from '../auth/entity/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletModule } from 'src/wallet/wallet.module';
import { RedisUtilModule } from 'src/util-module/redis/redis-util.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ScheduleModule.forRoot(),
    WalletModule,
    RedisUtilModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
