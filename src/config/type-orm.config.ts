import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { EnvKeys } from 'src/common/enum/env-keys';
import { DiaryOrmEntity } from 'src/infrastructure/database/entity/diary.orm-entity';
import { PledgeOrmEntity } from 'src/infrastructure/database/entity/pledge.orm-entity';
import { UserOrmEntity } from 'src/infrastructure/database/entity/user.orm-entity';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get(EnvKeys.DB_HOST),
    port: configService.get(EnvKeys.DB_PORT),
    username: configService.get(EnvKeys.DB_USERNAME),
    password: configService.get(EnvKeys.DB_PASSWORD),
    database: configService.get(EnvKeys.DB_DATABASE),
    entities: [UserOrmEntity, PledgeOrmEntity, DiaryOrmEntity],
    synchronize: true,
  }),
};
