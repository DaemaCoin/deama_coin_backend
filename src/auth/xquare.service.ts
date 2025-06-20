import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { LoginFailException } from 'src/exception/custom-exception/login-fail.exception';

@Injectable()
export class XquareService {
  xquareBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.xquareBaseUrl = this.configService.get(EnvKeys.XQUARE_LOGIN_URL);
  }

  async xquarelogin(accountId: string, password: string): Promise<string> {
    const res = await fetch(this.xquareBaseUrl, {
      method: 'post',
      body: JSON.stringify({
        account_id: accountId,
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status != 200) throw new LoginFailException();
    const data = await res.json();

    return data.id;
  }
}
