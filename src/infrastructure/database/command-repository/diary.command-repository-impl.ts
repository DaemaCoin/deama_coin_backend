import { InjectRepository } from '@nestjs/typeorm';
import { SaveDiaryCommand } from 'src/domain/diary/command/save-diary.command';
import { UpdateDiaryCommand } from 'src/domain/diary/command/update-diary.command';
import { Diary } from 'src/domain/diary/model/diary.model';
import { DiaryCommandRepository } from 'src/domain/diary/repository/diary.command-repository';
import { EntityManager, Repository } from 'typeorm';
import { DiaryOrmEntity } from '../entity/diary.orm-entity';
import { generateToday } from 'src/common/util/generate-ko-time';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DiaryCommandRepositoryImpl implements DiaryCommandRepository {
  constructor(
    @InjectRepository(DiaryOrmEntity)
    private readonly diaryRepository: Repository<DiaryOrmEntity>,
  ) {}

  async save(
    command: SaveDiaryCommand,
    entityManager?: EntityManager,
  ): Promise<Diary> {
    const { detail } = command;

    if (entityManager) {
      return this.toDiary(
        await entityManager.save(DiaryOrmEntity, {
          detail,
          createdAt: generateToday(),
        }),
      );
    } else {
      return this.toDiary(
        await this.diaryRepository.save({
          detail,
          createdAt: generateToday(),
        }),
      );
    }
  }

  async update(
    command: UpdateDiaryCommand,
    entityManager?: EntityManager,
  ): Promise<void> {
    const { diaryId, detail } = command;

    if (entityManager) {
      await entityManager.update(
        DiaryOrmEntity,
        {
          id: diaryId,
        },
        {
          detail,
          createdAt: generateToday(),
        },
      );
    } else {
      await this.diaryRepository.update(
        {
          id: diaryId,
        },
        {
          detail,
          createdAt: generateToday(),
        },
      );
    }
  }

  private toDiary(diaryEntity: DiaryOrmEntity): Diary {
    return new Diary(diaryEntity.id, diaryEntity.detail, diaryEntity.createdAt);
  }
}
