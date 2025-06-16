import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisUtilService {
  constructor(
    @InjectRedis()
    private readonly redisClient: Redis,
  ) {}

  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return await this.redisClient.set(key, value, 'EX', ttlSeconds);
    }
    return await this.redisClient.set(key, value);
  }

  async delete(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      return await this.redisClient.del(...keys);
    }
    return 0;
  }
}
