import { Inject, Injectable } from '@nestjs/common';
import {
  GITHUB_REPOSITORY_TOKEN,
  GithubRepository,
} from '../repository/github.repository.interface';
import { GitRepo } from '../model/git-repo.model';

@Injectable()
export class GetUserRepoUseCase {
  constructor(
    @Inject(GITHUB_REPOSITORY_TOKEN)
    private readonly githubRepository: GithubRepository,
  ) {}

  async execute(githubToken: string): Promise<GitRepo> {
    return await this.githubRepository.getUserRepo(githubToken);
  }
}
