import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from 'src/infrastructure/database/entity/user.orm-entity';
import { AuthController } from './controller/auth.controller';
import { AuthService } from 'src/application/auth/auth.service';
import { FindOneUserUseCase } from 'src/domain/user/usecase/find-one-user.usecase';
import { SaveUserUseCase } from 'src/domain/user/usecase/save-user.usecase';
import { USER_COMMAND_REPOSITORY_TOKEN } from 'src/domain/user/repository/user.command-repository';
import { UserCommandRepositoryImpl } from 'src/infrastructure/database/command-repository/user.command-repository-impl';
import { UserQueryRepositoryImpl } from 'src/infrastructure/database/query-repository/user.query-repository-impl';
import { USER_QUERY_REPOSITORY_TOKEN } from 'src/domain/user/repository/user.query-repository';
import { CacheModule } from '../util/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), CacheModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FindOneUserUseCase,
    SaveUserUseCase,
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
export class AuthModule {}
