import { Inject } from '@nestjs/common';
import { CACHE_REPOSITORY_TOKEN, CacheRepository } from './cache-repository';

export class GetCacheUseCase {
  constructor(
    @Inject(CACHE_REPOSITORY_TOKEN)
    private readonly cacheRepository: CacheRepository,
  ) {}

  async execute(key: string): Promise<string | null> {
    return await this.cacheRepository.get(key);
  }
}
