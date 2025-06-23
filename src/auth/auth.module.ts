import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { XquareService } from './xquare.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { GithubModule } from 'src/github/github.module';
import { CoinEntity } from 'src/coin/entity/coin.entity';
import { RedisUtilModule } from 'src/util-module/redis/redis-util.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CoinEntity]),
    WalletModule,
    GithubModule,
    RedisUtilModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, XquareService],
  exports: [TypeOrmModule.forFeature([UserEntity])],
})
export class AuthModule {}
