import { WellPromiseCommand } from '../command/welll-promise.command';

export const CHAT_QUERY_REPOSITORY = 'CHAT_QUERY_REPOSITORY';

export interface ChatQueryRepository {
  wellProimse(
    command: WellPromiseCommand,
    entityManager?: unknown,
  );
}
