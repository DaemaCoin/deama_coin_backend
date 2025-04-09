import { Inject, Injectable } from '@nestjs/common';
import {
  REDIS_REPOSITORY_TOKEN,
  RedisRepository,
} from '../repository/redis.repository.interface';

@Injectable()
export class SetRedisUseCase {
  constructor(
    @Inject(REDIS_REPOSITORY_TOKEN)
    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(key: string, value: string): Promise<void> {
    await this.redisRepository.set(key, value);
  }
}
