import { Inject, Injectable } from '@nestjs/common';
import {
  DIARY_COMMAND_REPOSITORY_TOKEN,
  DiaryCommandRepository,
} from '../repository/diary.command-repository';
import { SaveDiaryCommand } from '../command/save-diary.command';
import { Diary } from '../model/diary.model';

@Injectable()
export class SaveDiaryUseCase {
  constructor(
    @Inject(DIARY_COMMAND_REPOSITORY_TOKEN)
    private readonly diaryCommandRepository: DiaryCommandRepository,
  ) {}

  async execute(command: SaveDiaryCommand): Promise<Diary> {
    return await this.diaryCommandRepository.save(command);
  }
}
