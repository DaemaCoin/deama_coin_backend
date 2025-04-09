import { Inject, Injectable } from '@nestjs/common';
import {
  GITHUB_REPOSITORY_TOKEN,
  GithubRepository,
} from '../repository/github.repository.interface';
import { GitToken } from '../model/git-token.model';

@Injectable()
export class GithubLoginUseCase {
  constructor(
    @Inject(GITHUB_REPOSITORY_TOKEN)
    private readonly githubRepository: GithubRepository,
  ) {}

  async execute(code: string): Promise<GitToken> {
    return await this.githubRepository.githubLogin(code);
  }
}
