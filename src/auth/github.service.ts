import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { InvalidAccessException } from 'src/exception/custom-exception/invalid-access.exception';

@Injectable()
export class GithubService {
  constructor(private readonly configService: ConfigService) {}

  async getUserRepo(githubToken: string): Promise<string[]> {
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
    return data;
  }

  async createGitHook(githubToken: string, fullName: string): Promise<void> {
    await fetch(`https://api.github.com/repos/${fullName}/hooks`, {
      method: 'post',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: 'https://daemacoin-server.xquare.app/wallet/hook',
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

  async githubLogin(code: string): Promise<string> {
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

  async getGithubUser(githubToken: string): Promise<string> {
    const res = await fetch('https://api.github.com/user', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubToken}`,
      },
    });
    const data = await res.json();
    if (data.error) throw new InvalidAccessException();

    return data.login;
  }

  async getCommitData(commitId: string) {
    const res = await fetch(`https://api.github.com/repos/DaemaCoin/deama_coin_backend/commits/${commitId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();

    return data;
  }
}
