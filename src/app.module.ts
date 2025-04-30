import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { configModule } from './config/config';
import { typeOrmModule } from './config/type-orm.config';
import { jwtModule } from './config/jwt.config';
import { CoinModule } from './coin/coin.module';

@Module({
  imports: [configModule, typeOrmModule, jwtModule, AuthModule, CoinModule],
  providers: [],
})
export class AppModule {}
