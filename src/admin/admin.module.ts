import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [StoreModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 