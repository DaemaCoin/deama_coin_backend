import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { StoreApplicationEntity } from 'src/store/entity/store-application.entity';
import { StoreEntity } from 'src/store/entity/store.entity';
import { ProductEntity } from 'src/store/entity/product.entity';
import { OrderEntity } from 'src/store/entity/order.entity';
import { OrderItemEntity } from 'src/store/entity/order-item.entity';
import { EnvKeys } from 'src/common/env.keys';
import { CoinEntity } from 'src/wallet/entity/commit.entity';

export const typeOrmModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get(EnvKeys.DB_HOST),
    port: configService.get(EnvKeys.DB_PORT),
    username: configService.get(EnvKeys.DB_USERNAME),
    password: configService.get(EnvKeys.DB_PASSWORD),
    database: configService.get(EnvKeys.DB_DATABASE),
    entities: [
      UserEntity,
      CoinEntity,
      StoreApplicationEntity,
      StoreEntity,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
    ],
    synchronize: true,
  }),
});
