import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { CoinModule } from './coin/coin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        GITHUB_CLIENT_ID: Joi.string().required(),
        GITHUB_SECRET_ID: Joi.string().required(),
        GITHUB_LOGIN_URL: Joi.string().required(),
      }),
    }),
    AuthModule,
    CoinModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
