import { GitRepo } from '../model/git-repo.model';
import { GitToken } from '../model/git-token.model';

export const GITHUB_REPOSITORY_TOKEN = 'GITHUB_REPOSITORY_TOKEN';

export interface GithubRepository {
  getUserRepo(githubToken: string): Promise<GitRepo>;
  createGitHook(githubToken: string, fullName: string): Promise<void>;
  githubLogin(code: string): Promise<GitToken>;
}
