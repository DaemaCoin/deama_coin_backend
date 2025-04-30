import { Inject, Injectable } from '@nestjs/common';
import { Pledge } from '../model/pledge.model';
import {
  PLEDGE_COMMAND_REPOSITORY_TOKEN,
  PledgeCommandRepository,
} from '../repository/pledge.command-repository';

@Injectable()
export class SavePledgeUseCase {
  constructor(
    @Inject(PLEDGE_COMMAND_REPOSITORY_TOKEN)
    private readonly pledgeRepository: PledgeCommandRepository,
  ) {}

  async execute(
    command: Partial<Pledge>,
    entityManager?: unknown,
  ): Promise<Pledge> {
    return await this.pledgeRepository.save(command, entityManager);
  }
}
