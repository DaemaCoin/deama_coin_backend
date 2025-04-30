import { Inject, Injectable } from '@nestjs/common';
import { Pledge } from '../model/pledge.model';
import {
  PLEDGE_COMMAND_REPOSITORY_TOKEN,
  PledgeCommandRepository,
} from '../repository/pledge.command-repository';

@Injectable()
export class DeletePledgeUseCase {
  constructor(
    @Inject(PLEDGE_COMMAND_REPOSITORY_TOKEN)
    private readonly pledgeRepository: PledgeCommandRepository,
  ) {}

  async execute(
    command: Required<Pick<Pledge, 'id' | 'userId'>>,
    entityManager?: unknown,
  ): Promise<void> {
    return await this.pledgeRepository.delete(command, entityManager);
  }
}
