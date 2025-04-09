import { Inject, Injectable } from '@nestjs/common';
import {
  REDIS_REPOSITORY_TOKEN,
  RedisRepository,
} from '../repository/redis.repository.interface';

@Injectable()
export class GetRedisUseCase {
  constructor(
    @Inject(REDIS_REPOSITORY_TOKEN)
    private readonly redisRepository: RedisRepository,
  ) {}

  async execute(key: string): Promise<string> {
    return await this.redisRepository.get(key);
  }
}
