import { GetPledgesCommand } from '../command/get-pledges.command';
import { Pledge } from '../model/pledge.model';

export const PLEDGE_QUERY_REPOSITORY_TOKEN = 'PLEDGE_QUERY_REPOSITORY_TOKEN';

export interface PledgeQueryRepository {
  findOne(
    where: Pick<Partial<Pledge>, 'id' | 'userId'>,
    entityManager?: unknown,
  ): Promise<Pledge | null>;

  getPledges(
    where: GetPledgesCommand,
    entityManager?: unknown,
  ): Promise<Pledge[]>;
}
