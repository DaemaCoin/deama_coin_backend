import { Inject, Injectable } from '@nestjs/common';
import { User } from '../model/user.model';
import { USER_COMMAND_REPOSITORY_TOKEN, UserCommandRepository } from '../repository/user.command-repository';

@Injectable()
export class SaveUserUseCase {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY_TOKEN)
    private readonly userRepository: UserCommandRepository,
  ) {}

  async execute(command: Partial<User>): Promise<User> {
    return await this.userRepository.save(command);
  }
}