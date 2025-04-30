import { Inject, Injectable } from '@nestjs/common';
import { Pledge } from '../model/pledge.model';
import {
  PLEDGE_QUERY_REPOSITORY_TOKEN,
  PledgeQueryRepository,
} from '../repository/pledge.query-repository';

@Injectable()
export class FindOnePledgeUseCase {
  constructor(
    @Inject(PLEDGE_QUERY_REPOSITORY_TOKEN)
    private readonly pledgeRepository: PledgeQueryRepository,
  ) {}

  async execute(command: Partial<Pledge>, entityManager?: unknown): Promise<Pledge | null> {
    return await this.pledgeRepository.findOne(command, entityManager);
  }
}
