import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CoinEntity } from './entity/commit.entity';
import { GithubModule } from 'src/github/github.module';
import { GeminiModule } from 'src/gemini/gemini.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CoinEntity]),
    GithubModule,
    GeminiModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
