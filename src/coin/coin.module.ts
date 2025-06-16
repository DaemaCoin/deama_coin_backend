import { Module } from '@nestjs/common';
import { CoinController } from './coin.controller';
import { CoinService } from './coin.service';
import { GithubModule } from 'src/github/github.module';
import { GeminiUtilModule } from 'src/util-module/gemini/gemini.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinEntity } from './entity/coin.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CoinEntity]),
    GithubModule,
    GeminiUtilModule,
    WalletModule,
  ],
  controllers: [CoinController],
  providers: [CoinService],
})
export class CoinModule {}
