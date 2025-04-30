import { SaveDiaryCommand } from '../command/save-diary.command';
import { UpdateDiaryCommand } from '../command/update-diary.command';
import { Diary } from '../model/diary.model';

export const DIARY_COMMAND_REPOSITORY_TOKEN = 'DIARY_COMMAND_REPOSITORY_TOKEN';

export interface DiaryCommandRepository {
  save(command: SaveDiaryCommand, entityManager?: unknown): Promise<Diary>;
  update(command: UpdateDiaryCommand, entityManager?: unknown): Promise<void>;
}
