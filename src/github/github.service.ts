import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { GithubHookI } from 'src/common/interface/git-hook.interface';
import { GithubRepoI } from 'src/common/interface/git-repo.interface';
import { FetchMethod } from 'src/common/util/fetch-method';
import { GithubClient } from './github-client';

@Injectable()
export class GithubService {
  constructor(
    private readonly configService: ConfigService,
    private readonly githubClient: GithubClient,
  ) {}

  async getUserRepo(githubToken: string, page: number): Promise<any[]> {
    const res = await this.githubClient.fetch<GithubRepoI[]>(
      `https://api.github.com/user/repos?per_page=100&page=${page}&type=public`,
      [200],
      {
        method: FetchMethod.GET,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
        },
      },
    );

    return res;
  }

  async createGitHook(githubToken: string, fullName: string): Promise<void> {
    await this.githubClient.fetch(
      `https://api.github.com/repos/${fullName}/hooks`,
      [201, 422],
      {
        method: FetchMethod.POST,
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
      },
    );
  }

  async githubLogin(code: string): Promise<string> {
    const res = await this.githubClient.fetch<{
      access_token: string;
      error?: string;
    }>('https://github.com/login/oauth/access_token', [200], {
      method: FetchMethod.POST,
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

    return res.access_token;
  }

  async getGithubUser(
    githubToken: string,
  ): Promise<{ id: string; image: string }> {
    const res = await this.githubClient.fetch<{
      login: string;
      avatar_url: string;
      error?: string;
    }>('https://api.github.com/user', [200], {
      method: FetchMethod.GET,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubToken}`,
      },
    });

    return { id: res.login, image: res.avatar_url };
  }

  async getCommitData(fullName: string, commitId: string): Promise<any> {
    const GIT_TOKEN = await this.configService.get(EnvKeys.GIT_TOKEN);
    return await this.githubClient.fetch<any>(
      `https://api.github.com/repos/${fullName}/commits/${commitId}`,
      [200],
      {
        method: FetchMethod.GET,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GIT_TOKEN}`
        },
      },
    );
  }

  async getRepoHooks(
    githubToken: string,
    fullName: string,
  ): Promise<GithubHookI[]> {
    return await this.githubClient.fetch<GithubHookI[]>(
      `https://api.github.com/repos/${fullName}/hooks`,
      [200, 404],
      {
        method: FetchMethod.GET,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
        },
      },
    );
  }

  async deleteGitHook(githubToken: string, hookUrl: string): Promise<void> {
    await this.githubClient.fetch(hookUrl, [204], {
      method: FetchMethod.DELETE,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${githubToken}`,
      },
    });
  }
}
