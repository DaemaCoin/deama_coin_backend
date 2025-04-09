import { Module } from '@nestjs/common';

import { configModule } from './config/config';
import { typeOrmModule } from './config/type-orm.config';
import { jwtModule } from './config/jwt.config';
import { redisModule } from './config/redis.config';

import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt.guard';

import { AuthModule } from './presentation/auth/auth.module';
import { CoinModule } from './presentation/coin/coin.module';

@Module({
  imports: [
    configModule,
    typeOrmModule,
    jwtModule,
    redisModule,
    AuthModule,
    CoinModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
