import { XquareUser } from '../model/xquare-user.model';

export const XQUARE_REPOSITORY_TOKEN = 'XQUARE_REPOSITORY_TOKEN';

export interface XquareRepository {
  getXquareUser(accountId: string, password: string): Promise<XquareUser>;
}
