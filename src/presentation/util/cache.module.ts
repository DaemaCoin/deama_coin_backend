import { Module } from '@nestjs/common';
import { CACHE_REPOSITORY_TOKEN } from 'src/domain/cache/cache-repository';
import { GetCacheUseCase } from 'src/domain/cache/get-cache.usecase';
import { SetCacheUseCase } from 'src/domain/cache/set-cache.usecase';
import { CacheRepositoryImpl } from 'src/infrastructure/cache/cache-repository-impl';

@Module({
  providers: [
    GetCacheUseCase,
    SetCacheUseCase,
    {
      provide: CACHE_REPOSITORY_TOKEN,
      useClass: CacheRepositoryImpl,
    },
  ],
  exports: [GetCacheUseCase, SetCacheUseCase],
})
export class CacheModule {}
