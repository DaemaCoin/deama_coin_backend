import { Inject, Injectable } from '@nestjs/common';
import {
  DIARY_COMMAND_REPOSITORY_TOKEN,
  DiaryCommandRepository,
} from '../repository/diary.command-repository';
import { UpdateDiaryCommand } from '../command/update-diary.command';

@Injectable()
export class UpdateDiaryUseCase {
  constructor(
    @Inject(DIARY_COMMAND_REPOSITORY_TOKEN)
    private readonly diaryCommandRepository: DiaryCommandRepository,
  ) {}

  async execute(command: UpdateDiaryCommand): Promise<void> {
    await this.diaryCommandRepository.update(command);
  }
}
