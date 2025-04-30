import { User } from 'src/domain/user/model/user.model';
import { UserQueryRepository } from 'src/domain/user/repository/user.query-repository';
import { EntityManager, Repository } from 'typeorm';
import { UserOrmEntity } from '../entity/user.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Diary } from 'src/domain/diary/model/diary.model';

@Injectable()
export class UserQueryRepositoryImpl implements UserQueryRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async findOne(
    where: Partial<User>,
    entityManager?: EntityManager,
  ): Promise<User | null> {
    let user: UserOrmEntity | null;

    if (entityManager) {
      user = await entityManager.findOne(UserOrmEntity, { where });
    } else {
      user = await this.userRepository.findOne({ where });
    }
    if (!user) return null;
    return this.toUser(user);
  }

  async findOneUserDiary(
    userId: string,
    entityManager?: EntityManager,
  ): Promise<User | null> {
    let user: UserOrmEntity | null;

    if (entityManager) {
      user = await entityManager.findOne(UserOrmEntity, {
        where: { id: userId },
        relations: { diary: true },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { diary: true },
      });
    }

    if (!user) return null;
    return this.toUser(user);
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
      userEntity.diary
        ? new Diary(
            userEntity.diary.id,
            userEntity.diary.detail,
            userEntity.diary.createdAt,
          )
        : undefined,
    );
  }
}
