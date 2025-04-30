import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { InvalidAccessException } from 'src/exception/custom-exception/invalid-access.exception';
import { LoginRequest } from './dto/request/login.request';
import { LoginFailException } from 'src/exception/custom-exception/login-fail.exception';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  /// GitHub APIS
  private async getUserRepo(githubToken: string): Promise<string[]> {
    const res = await fetch('https://api.github.com/user/repos', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubToken}`,
      },
    });
    const data = (await res.json()).map(
      (value: { full_name: string }) => value.full_name,
    );
    console.log(data);
    // todo :: data로 바꾸기
    return ['ljyo2o9/My_Learn_File'];
  }

  private async createGitHook(githubToken: string, fullName: string): Promise<void> {
    await fetch(`https://api.github.com/repos/${fullName}/hooks`, {
      method: 'post',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: 'https://daemacoin-server.xquare.app/coin/hook',
          content_type: 'json',
          insecure_ssl: '0',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubToken}`,
      },
    });
  }

  private async githubLogin(code: string): Promise<string> {
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
    if (data.error) throw new InvalidAccessException();

    return data.access_token;
  }

  async githubOAuth(code: string) {
    const githubAccessToken = await this.githubLogin(code);

    (await this.getUserRepo(githubAccessToken)).forEach((repoName: string) => {
      this.createGitHook(githubAccessToken, repoName);
    });

    return code;
  }

  /// Xquare User Login
  private async getXquareUser(
    accountId: string,
    password: string,
  ): Promise<string> {
    const res = await fetch(String(this.configService.get(EnvKeys.XQUARE_LOGIN_URL)), {
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

  async xquarelogin(dto: LoginRequest) {
    const { accountId, password } = dto;
    const xquareId = await this.getXquareUser(accountId, password);

    return xquareId;
  }
}
