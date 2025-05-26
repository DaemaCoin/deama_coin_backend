import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { EnvKeys } from 'src/common/env.keys';

export const typeOrmModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get(EnvKeys.DB_HOST),
    port: configService.get(EnvKeys.DB_PORT),
    username: configService.get(EnvKeys.DB_USERNAME),
    password: configService.get(EnvKeys.DB_PASSWORD),
    database: configService.get(EnvKeys.DB_DATABASE),
    entities: [UserEntity],
    synchronize: true,
  }),
});
