import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { GitRepo } from 'src/domain/github/model/git-repo.model';
import { GitToken } from 'src/domain/github/model/git-token.model';
import { GithubRepository } from 'src/domain/github/repository/github.repository.interface';
import { InvalidAccessException } from 'src/exception/custom-exception/invalid-access.exception';

@Injectable()
export class GithubRepositoryImpl implements GithubRepository {
  constructor(private readonly configService: ConfigService) {}

  async getUserRepo(githubToken: string): Promise<GitRepo> {
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
    return new GitRepo(['ljyo2o9/My_Learn_File']);
  }

  async createGitHook(githubToken: string, fullName: string): Promise<void> {
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

  async githubLogin(code: string): Promise<GitToken> {
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

    return new GitToken(data.access_token, data.token_type, data.scope);
  }
}
