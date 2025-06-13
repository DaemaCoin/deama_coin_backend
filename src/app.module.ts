import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { configModule } from './config/config';
import { typeOrmModule } from './config/type-orm.config';
import { jwtModule } from './config/jwt.config';
import { WalletModule } from './wallet/wallet.module';
import { StoreModule } from './store/store.module';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt.guard';
import { GithubModule } from './github/github.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { CoinModule } from './coin/coin.module';

@Module({
  imports: [
    configModule,
    typeOrmModule,
    jwtModule,
    AuthModule,
    GithubModule,
    WalletModule,
    CoinModule,
    StoreModule,
    AdminModule,
    LeaderboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
