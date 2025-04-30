import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/user/model/user.model';
import { UserCommandRepository } from 'src/domain/user/repository/user.command-repository';
import { UserOrmEntity } from '../entity/user.orm-entity';
import { EntityManager, Repository } from 'typeorm';
import { uuid } from 'src/common/util/generate-uuid';
import { generateNow } from 'src/common/util/generate-ko-time';
import { SaveUserDiaryCommand } from 'src/domain/user/command/save-user-diary.command';

export class UserCommandRepositoryImpl implements UserCommandRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async save(
    user: Partial<User>,
    entityManager?: EntityManager,
  ): Promise<User> {
    if (entityManager) {
      return this.toUser(
        await entityManager.save(UserOrmEntity, {
          ...user,
          id: uuid(),
          createdAt: generateNow(),
        }),
      );
    } else {
      return this.toUser(
        await this.userRepository.save({
          ...user,
          id: uuid(),
          createdAt: generateNow(),
        }),
      );
    }
  }

  async saveUserDiary(
    command: SaveUserDiaryCommand,
    entityManager?: EntityManager,
  ): Promise<void> {
    const { userId, diaryId } = command;

    if (entityManager) {
      await entityManager.update(
        UserOrmEntity,
        { id: userId },
        {
          diary: { id: diaryId },
        },
      );
    } else {
      await this.userRepository.update(
        { id: userId },
        {
          diary: { id: diaryId },
        },
      );
    }
  }

  private toUser(userEntity: UserOrmEntity): User {
    return new User(
      userEntity.id,
      userEntity.email,
      userEntity.password,
      userEntity.nickname,
      userEntity.role,
      userEntity.withdrawDate,
      userEntity.createdAt,
    );
  }
}
