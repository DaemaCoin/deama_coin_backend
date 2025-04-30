import { SaveUserDiaryCommand } from '../command/save-user-diary.command';
import { User } from '../model/user.model';

export const USER_COMMAND_REPOSITORY_TOKEN = 'USER_COMMAND_REPOSITORY_TOKEN';

export interface UserCommandRepository {
  save(user: Partial<User>, entityManager?: unknown): Promise<User>;
  saveUserDiary(command: SaveUserDiaryCommand, entityManager?: unknown): Promise<void>;
}
