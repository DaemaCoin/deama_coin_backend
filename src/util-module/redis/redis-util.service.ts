import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisUtilService {
  constructor(
    @InjectRedis()
    private readonly redisClient: Redis,
  ) {}

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      console.error(`Redis에서 키(${key}) 조회 실패: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis에 키(${key}) 저장 실패: ${error.message}`);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis에서 키(${key}) 삭제 실패: ${error.message}`);
      return false;
    }
  }

  async deleteByPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        const result = await this.redisClient.del(...keys);
        return result > 0;
      }
      return true;
    } catch (error) {
      console.error(`Redis에서 패턴(${pattern})에 일치하는 키 삭제 실패: ${error.message}`);
      return false;
    }
  }
}
