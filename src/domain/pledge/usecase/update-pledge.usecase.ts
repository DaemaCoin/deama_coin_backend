import { Inject, Injectable } from '@nestjs/common';
import {
  PLEDGE_COMMAND_REPOSITORY_TOKEN,
  PledgeCommandRepository,
} from '../repository/pledge.command-repository';
import { UpdatePledgeCommand } from '../command/update-pledge.command';

@Injectable()
export class UpdatePledgeUseCase {
  constructor(
    @Inject(PLEDGE_COMMAND_REPOSITORY_TOKEN)
    private readonly pledgeRepository: PledgeCommandRepository,
  ) {}

  async execute(
    command: UpdatePledgeCommand,
    entityManager?: unknown,
  ): Promise<void> {
    await this.pledgeRepository.update(command, entityManager);
  }
}
