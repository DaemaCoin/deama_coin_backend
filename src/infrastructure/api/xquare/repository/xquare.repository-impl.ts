import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { XquareUser } from 'src/domain/xquare/model/xquare-user.model';
import { XquareRepository } from 'src/domain/xquare/repository/xquare.repository.interface';
import { LoginFailException } from 'src/exception/custom-exception/login-fail.exception';

@Injectable()
export class XquareRepositoryImpl implements XquareRepository {
  constructor(private readonly configService: ConfigService) {}

  async getXquareUser(
    accountId: string,
    password: string,
  ): Promise<XquareUser> {
    const res = await fetch(this.configService.get(EnvKeys.XQUARE_LOGIN_URL), {
      method: 'post',
      body: JSON.stringify({
        account_id: accountId,
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status != 200) throw new LoginFailException();
    const data = await res.json();

    return new XquareUser(data.id, data.account_id);
  }
}
