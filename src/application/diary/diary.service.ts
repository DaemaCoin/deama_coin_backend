import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from 'src/common/exception/custom-exception/user-not-found.exception';
import { SaveDiaryCommand } from 'src/domain/diary/command/save-diary.command';
import { UpdateDiaryCommand } from 'src/domain/diary/command/update-diary.command';
import { FindOneDiaryUseCase } from 'src/domain/diary/usecase/find-one-diary.usecase';
import { SaveDiaryUseCase } from 'src/domain/diary/usecase/save-diary.usecase';
import { UpdateDiaryUseCase } from 'src/domain/diary/usecase/update-diary.usecase';
import { SaveUserDiaryCommand } from 'src/domain/user/command/save-user-diary.command';
import { FindOneUserDiaryUseCase } from 'src/domain/user/usecase/find-one-user-diary.usecase';
import { SaveUserDiaryUseCase } from 'src/domain/user/usecase/save-user-diary.usecase';
import { SaveDiaryRequest } from 'src/presentation/diary/dto/request/save-diary.request';

@Injectable()
export class DiaryService {
  constructor(
    private readonly findOneDiaryUseCase: FindOneDiaryUseCase,
    private readonly findOneUserDiary: FindOneUserDiaryUseCase,
    private readonly updateDiaryUseCase: UpdateDiaryUseCase,
    private readonly saveDiaryUseCase: SaveDiaryUseCase,
    private readonly saveUserDiaryUseCase: SaveUserDiaryUseCase,
  ) {}

  async saveDiary(userId: string, saveDiaryRequest: SaveDiaryRequest) {
    const { detail } = saveDiaryRequest;
    const userWithDiary = await this.findOneUserDiary.execute(userId);
    if (!userWithDiary) throw new UserNotFoundException();

    if (userWithDiary.diary) {
      await this.updateDiaryUseCase.execute(
        new UpdateDiaryCommand(userWithDiary.diary.id, detail),
      );
    } else {
      const diary = await this.saveDiaryUseCase.execute(new SaveDiaryCommand(detail));
      await this.saveUserDiaryUseCase.execute(
        new SaveUserDiaryCommand(userId, diary.id),
      );
    }
  }
}
