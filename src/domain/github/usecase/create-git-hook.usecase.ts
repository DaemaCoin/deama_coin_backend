import { Inject, Injectable } from '@nestjs/common';
import {
  GITHUB_REPOSITORY_TOKEN,
  GithubRepository,
} from '../repository/github.repository.interface';

@Injectable()
export class CreateGitHookUseCase {
  constructor(
    @Inject(GITHUB_REPOSITORY_TOKEN)
    private readonly githubRepository: GithubRepository,
  ) {}

  async execute(githubToken: string, fullName: string): Promise<void> {
    await this.githubRepository.createGitHook(githubToken, fullName);
  }
}
