import { Inject } from '@nestjs/common';
import { CACHE_REPOSITORY_TOKEN, CacheRepository } from './cache-repository';

export class SetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY_TOKEN)
    private readonly cacheRepository: CacheRepository,
  ) {}

  async execute(key: string, value: string, ttl?: number): Promise<void> {
    await this.cacheRepository.set(key, value, ttl);
  }
}
