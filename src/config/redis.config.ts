import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';

export const redisModule = RedisModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'single',
    options: {
      host: configService.get(EnvKeys.REDIS_HOST),
      port: configService.get(EnvKeys.REDIS_PORT),
    },
  }),
});
