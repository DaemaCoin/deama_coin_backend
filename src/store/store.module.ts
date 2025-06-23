import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreApplicationEntity } from './entity/store-application.entity';
import { StoreEntity } from './entity/store.entity';
import { ProductEntity } from './entity/product.entity';
import { OrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { WalletModule } from '../wallet/wallet.module';
import { UserEntity } from 'src/auth/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      StoreApplicationEntity,
      StoreEntity,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
    WalletModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService, TypeOrmModule],
})
export class StoreModule {} 