import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guard/jwt-guard';
import { UserModule } from './presentation/user/user.module';
import { AuthModule } from './presentation/auth/auth.module';
import { CacheModule as CacheManagerModule } from '@nestjs/cache-manager';
import { typeOrmConfig } from './config/type-orm.config';
import { config } from './config/config';
import { cacheConfig } from './config/cache.config';
import { jwtConfig } from './config/jwt.config';
import { CacheModule } from './presentation/util/cache.module';
import { PledgeModule } from './presentation/pledge/pledge.module';
import { DiaryModule } from './presentation/diary/diary.module';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    CacheManagerModule.register(cacheConfig),
    JwtModule.register(jwtConfig),
    AuthModule,
    UserModule,
    CacheModule,
    PledgeModule,
    DiaryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
