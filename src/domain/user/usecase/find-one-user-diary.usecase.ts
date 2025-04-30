import { Inject, Injectable } from '@nestjs/common';
import { User } from '../model/user.model';
import {
  USER_QUERY_REPOSITORY_TOKEN,
  UserQueryRepository,
} from '../repository/user.query-repository';

@Injectable()
export class FindOneUserDiaryUseCase {
  constructor(
    @Inject(USER_QUERY_REPOSITORY_TOKEN)
    private readonly userRepository: UserQueryRepository,
  ) {}

  async execute(userId: string, entityManager?: unknown): Promise<User | null> {
    return await this.userRepository.findOneUserDiary(userId, entityManager);
  }
}
