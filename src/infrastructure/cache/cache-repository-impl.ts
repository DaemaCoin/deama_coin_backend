import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheRepository } from 'src/domain/cache/cache-repository';

export class CacheRepositoryImpl implements CacheRepository {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get(key: string): Promise<string | null> {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
}
