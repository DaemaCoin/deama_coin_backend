import { User } from '../model/user.model';

export const USER_QUERY_REPOSITORY_TOKEN = 'USER_QUERY_REPOSITORY_TOKEN';

export interface UserQueryRepository {
  findOne(where: Partial<User>, entityManager?: unknown): Promise<User | null>;
  findOneUserDiary(userId: string, entityManager?: unknown): Promise<User | null>;
}
