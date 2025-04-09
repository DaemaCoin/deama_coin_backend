import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    HTTP_PORT: Joi.number().required(),
    GITHUB_CLIENT_ID: Joi.string().required(),
    GITHUB_SECRET_ID: Joi.string().required(),
    GITHUB_LOGIN_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_SECRET_RE: Joi.string().required(),
    XQUARE_LOGIN_URL: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
  }),
});
