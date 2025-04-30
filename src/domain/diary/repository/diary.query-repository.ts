import { Diary } from '../model/diary.model';

export const DIARY_QUERY_REPOSITORY_TOKEN = 'DIARY_QUERY_REPOSITORY_TOKEN';

export interface DiaryQueryRepository {
  findOne(id: number, entityManager?: unknown): Promise<Diary | null>;
}
