import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisRepository } from 'src/domain/redis/repository/redis.repository.interface';

@Injectable()
export class RedisRepositoryImpl implements RedisRepository {
  constructor(
    @InjectRedis()
    private readonly redisClient: Redis,
  ) {}

  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) await this.redisClient.set(key, value, 'EX', ttl);
    else await this.redisClient.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
