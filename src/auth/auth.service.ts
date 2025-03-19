import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { InvalidAccessException } from 'src/exception/custom-exception/invalid-access.exception';
import { LoginRequest } from './dto/request/login.request';
import { User } from 'src/common/interface/user.interface';
import { LoginFailException } from 'src/exception/custom-exception/login-fail.exception';
import { JwtService } from '@nestjs/jwt';
import { TokensResponse } from './dto/response/tokens.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getUserRepo(githubToken: string): Promise<string[]> {
    const res = await fetch('https://api.github.com/user/repos', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubToken}`,
      },
    });
    const data = (await res.json()).map((value) => value.full_name);
    console.log(data);

    return ['ljyo2o9/My_Learn_File', 'ljyo2o9/Algorithm'];
  }

  async createHook(githubToken: string, fullName: string) {
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

    if (data.error) throw new InvalidAccessException();

    const githubAccessToken = data.access_token;
    (await this.getUserRepo(githubAccessToken)).map((value) => {
      this.createHook(githubAccessToken, value);
    });

    return code;
  }

  async generateTokens(userId: string) {
    const accessToken = await this.jwtService.signAsync(
      { userId },
      { secret: this.configService.get(EnvKeys.JWT_SECRET), expiresIn: '10h' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get(EnvKeys.JWT_SECRET_RE),
        expiresIn: '7d',
      },
    );
    return new TokensResponse(accessToken, refreshToken);
  }

  async login(loginRequest: LoginRequest) {
    const res = await fetch(
      'https://prod-server.xquare.app/dsm-login/user/user-data',
      {
        method: 'post',
        body: JSON.stringify(loginRequest),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (res.status != 200) throw new LoginFailException();

    const data: User = await res.json();
    return this.generateTokens(data.id);
  }

  async reIssue(userId: string) {
    return this.generateTokens(userId);
  }
}
