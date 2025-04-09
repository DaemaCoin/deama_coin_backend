import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoinModule } from './coin/coin.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt.guard';
import { configModule } from './config/config';
import { typeOrmConfig } from './config/type-orm.config';

@Module({
  imports: [configModule, typeOrmConfig, AuthModule, CoinModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
