import { Module } from '@nestjs/common';

import { configModule } from './config/config';
import { typeOrmConfig } from './config/type-orm.config';

import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt.guard';

import { AuthModule } from './presentation/auth/auth.module';
import { CoinModule } from './presentation/coin/coin.module';
import { jwtModule } from './config/jwt.config';

@Module({
  imports: [
    configModule,
    typeOrmConfig,
    jwtModule,
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
