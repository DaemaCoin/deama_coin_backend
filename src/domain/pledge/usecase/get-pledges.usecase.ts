import { Inject, Injectable } from '@nestjs/common';
import { Pledge } from '../model/pledge.model';
import {
  PLEDGE_QUERY_REPOSITORY_TOKEN,
  PledgeQueryRepository,
} from '../repository/pledge.query-repository';
import { GetPledgesCommand } from '../command/get-pledges.command';

@Injectable()
export class GetPledgesUseCase {
  constructor(
    @Inject(PLEDGE_QUERY_REPOSITORY_TOKEN)
    private readonly pledgeRepository: PledgeQueryRepository,
  ) {}

  async execute(
    command: GetPledgesCommand,
    entityManager?: unknown,
  ): Promise<Pledge[]> {
    return await this.pledgeRepository.getPledges(command, entityManager);
  }
}
