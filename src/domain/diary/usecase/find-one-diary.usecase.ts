import { Inject, Injectable } from '@nestjs/common';
import { Diary } from '../model/diary.model';
import {
  DIARY_QUERY_REPOSITORY_TOKEN,
  DiaryQueryRepository,
} from '../repository/diary.query-repository';

@Injectable()
export class FindOneDiaryUseCase {
  constructor(
    @Inject(DIARY_QUERY_REPOSITORY_TOKEN)
    private readonly diaryQueryRepository: DiaryQueryRepository,
  ) {}

  async execute(id: number): Promise<Diary | null> {
    return await this.diaryQueryRepository.findOne(id);
  }
}
