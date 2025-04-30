import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PledgeOrmEntity } from 'src/infrastructure/database/entity/pledge.orm-entity';
import { PledgeController } from './controller/pledge.controller';
import { PledgeService } from 'src/application/pledge/pledge.service';
import { GetPledgesUseCase } from 'src/domain/pledge/usecase/get-pledges.usecase';
import { SavePledgeUseCase } from 'src/domain/pledge/usecase/save-pledge.usecase';
import { PLEDGE_COMMAND_REPOSITORY_TOKEN } from 'src/domain/pledge/repository/pledge.command-repository';
import { PledgeCommandRepositoryImpl } from 'src/infrastructure/database/command-repository/pledge.command-repository-impl';
import { PLEDGE_QUERY_REPOSITORY_TOKEN } from 'src/domain/pledge/repository/pledge.query-repository';
import { PledgeQueryRepositoryImpl } from 'src/infrastructure/database/query-repository/pledge.query-repository-impl';
import { FindOnePledgeUseCase } from 'src/domain/pledge/usecase/find-one-pledge.usecase';
import { UpdatePledgeUseCase } from 'src/domain/pledge/usecase/update-pledge.usecase';
import { DeletePledgeUseCase } from 'src/domain/pledge/usecase/delete-pledge.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([PledgeOrmEntity])],
  controllers: [PledgeController],
  providers: [
    PledgeService,
    GetPledgesUseCase,
    FindOnePledgeUseCase,
    SavePledgeUseCase,
    UpdatePledgeUseCase,
    DeletePledgeUseCase,
    {
      provide: PLEDGE_COMMAND_REPOSITORY_TOKEN,
      useClass: PledgeCommandRepositoryImpl,
    },
    {
      provide: PLEDGE_QUERY_REPOSITORY_TOKEN,
      useClass: PledgeQueryRepositoryImpl,
    },
  ],
})
export class PledgeModule {}
