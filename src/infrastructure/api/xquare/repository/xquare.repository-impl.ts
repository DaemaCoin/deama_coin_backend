import { XquareUser } from 'src/domain/xquare/model/xquare-user.model';
import { XquareRepository } from 'src/domain/xquare/repository/xquare.repository.interface';
import { LoginFailException } from 'src/exception/custom-exception/login-fail.exception';

export class XquareRepositoryImpl implements XquareRepository {
  async getXquareUser(
    accountId: string,
    password: string,
  ): Promise<XquareUser> {
    const res = await fetch(
      'https://prod-server.xquare.app/dsm-login/user/user-data',
      {
        method: 'post',
        body: JSON.stringify({
          account_id: accountId,
          password,
        }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (res.status != 200) throw new LoginFailException();
    const data = await res.json();

    return new XquareUser(data.id, data.account_id);
  }
}
