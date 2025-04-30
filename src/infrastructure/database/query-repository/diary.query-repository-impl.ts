import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Diary } from 'src/domain/diary/model/diary.model';
import { DiaryQueryRepository } from 'src/domain/diary/repository/diary.query-repository';
import { DiaryOrmEntity } from '../entity/diary.orm-entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DiaryQueryRepositoryImpl implements DiaryQueryRepository {
  constructor(
    @InjectRepository(DiaryOrmEntity)
    private readonly diaryRepository: Repository<Diary>,
  ) {}

  async findOne(
    id: number,
    entityManager?: EntityManager,
  ): Promise<Diary | null> {
    let diary: DiaryOrmEntity | null;

    if (entityManager) {
      diary = await entityManager.findOne(DiaryOrmEntity, {
        where: { id },
      });
    } else {
      diary = await this.diaryRepository.findOne({ where: { id } });
    }
    if (!diary) return null;
    return this.toDiary(diary);
  }

  private toDiary(diaryEntity: DiaryOrmEntity): Diary {
    return new Diary(diaryEntity.id, diaryEntity.detail, diaryEntity.createdAt);
  }
}
