import { UpdatePledgeCommand } from '../command/update-pledge.command';
import { Pledge } from '../model/pledge.model';

export const PLEDGE_COMMAND_REPOSITORY_TOKEN =
  'PLEDGE_COMMAND_REPOSITORY_TOKEN';

export interface PledgeCommandRepository {
  save(command: Partial<Pledge>, entityManager?: unknown): Promise<Pledge>;
  update(command: UpdatePledgeCommand, entityManager?: unknown): Promise<void>;
  delete(
    command: Required<Pick<Pledge, 'id' | 'userId'>>,
    entityManager?: unknown,
  ): Promise<void>;
}
