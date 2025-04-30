import { Inject, Injectable } from '@nestjs/common';
import { USER_COMMAND_REPOSITORY_TOKEN, UserCommandRepository } from '../repository/user.command-repository';
import { SaveUserDiaryCommand } from '../command/save-user-diary.command';

@Injectable()
export class SaveUserDiaryUseCase {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY_TOKEN)
    private readonly userRepository: UserCommandRepository,
  ) {}

  async execute(command: SaveUserDiaryCommand): Promise<void> {
    return await this.userRepository.saveUserDiary(command);
  }
}