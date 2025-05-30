import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { configModule } from './config/config';
import { typeOrmModule } from './config/type-orm.config';
import { jwtModule } from './config/jwt.config';
import { WalletModule } from './wallet/wallet.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt.guard';

@Module({
  imports: [configModule, typeOrmModule, jwtModule, AuthModule, WalletModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
