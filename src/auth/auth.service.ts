import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async oauthGithub(code: string) {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'post',
      body: JSON.stringify({
        client_id: this.configService.get(EnvKeys.GITHUB_CLIENT_ID),
        client_secret: this.configService.get(EnvKeys.GITHUB_SECRET_ID),
        code,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    console.log(data);

    return code;
  }
}
