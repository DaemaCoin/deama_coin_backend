import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from '../common/env.keys';

export const jwtModule = JwtModule.registerAsync({
  global: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get(EnvKeys.JWT_SECRET),
    signOptions: {
      expiresIn: '24h',
    },
  }),
});
