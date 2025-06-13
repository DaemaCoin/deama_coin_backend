import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CoinEntity } from '../coin/entity/coin.entity';
import { BlockchainClient } from './block-chain-client';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CoinEntity])],
  controllers: [WalletController],
  providers: [WalletService, BlockchainClient],
  exports: [WalletService],
})
export class WalletModule {}
