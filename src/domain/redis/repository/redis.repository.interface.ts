export const REDIS_REPOSITORY_TOKEN = 'REDIS_REPOSITORY_TOKEN';

export interface RedisRepository {
  get(key: string): Promise<string>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}
