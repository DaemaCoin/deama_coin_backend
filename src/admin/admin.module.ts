import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StoreModule } from '../store/store.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [StoreModule, WalletModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 