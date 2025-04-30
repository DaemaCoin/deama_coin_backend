import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryService } from 'src/application/diary/diary.service';
import { DIARY_COMMAND_REPOSITORY_TOKEN } from 'src/domain/diary/repository/diary.command-repository';
import { DIARY_QUERY_REPOSITORY_TOKEN } from 'src/domain/diary/repository/diary.query-repository';
import { FindOneDiaryUseCase } from 'src/domain/diary/usecase/find-one-diary.usecase';
import { SaveDiaryUseCase } from 'src/domain/diary/usecase/save-diary.usecase';
import { UpdateDiaryUseCase } from 'src/domain/diary/usecase/update-diary.usecase';
import { USER_QUERY_REPOSITORY_TOKEN } from 'src/domain/user/repository/user.query-repository';
import { FindOneUserDiaryUseCase } from 'src/domain/user/usecase/find-one-user-diary.usecase';
import { DiaryCommandRepositoryImpl } from 'src/infrastructure/database/command-repository/diary.command-repository-impl';
import { DiaryOrmEntity } from 'src/infrastructure/database/entity/diary.orm-entity';
import { UserOrmEntity } from 'src/infrastructure/database/entity/user.orm-entity';
import { DiaryQueryRepositoryImpl } from 'src/infrastructure/database/query-repository/diary.query-repository-impl';
import { UserQueryRepositoryImpl } from 'src/infrastructure/database/query-repository/user.query-repository-impl';
import { DiaryController } from './controller/diary.controller';
import { USER_COMMAND_REPOSITORY_TOKEN } from 'src/domain/user/repository/user.command-repository';
import { UserCommandRepositoryImpl } from 'src/infrastructure/database/command-repository/user.command-repository-impl';
import { SaveUserDiaryUseCase } from 'src/domain/user/usecase/save-user-diary.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([DiaryOrmEntity, UserOrmEntity])],
  controllers: [DiaryController],
  providers: [
    DiaryService,
    FindOneDiaryUseCase,
    SaveDiaryUseCase,
    UpdateDiaryUseCase,
    FindOneUserDiaryUseCase,
    SaveUserDiaryUseCase,
    {
      provide: DIARY_COMMAND_REPOSITORY_TOKEN,
      useClass: DiaryCommandRepositoryImpl,
    },
    {
      provide: DIARY_QUERY_REPOSITORY_TOKEN,
      useClass: DiaryQueryRepositoryImpl,
    },
    {
      provide: USER_COMMAND_REPOSITORY_TOKEN,
      useClass: UserCommandRepositoryImpl,
    },
    {
      provide: USER_QUERY_REPOSITORY_TOKEN,
      useClass: UserQueryRepositoryImpl,
    },
  ],
})
export class DiaryModule {}
