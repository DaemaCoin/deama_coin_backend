export const CACHE_REPOSITORY_TOKEN = 'CACHE_REPOSITORY_TOKEN';

export interface CacheRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
}
