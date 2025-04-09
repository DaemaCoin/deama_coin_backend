import { Injectable } from '@nestjs/common';
import { TokensResponse } from 'src/presentation/auth/dto/response/tokens.response';
import { GenerateAccessTokenUseCase } from 'src/domain/jwt/usecase/generate-access-token.usecase';
import { GenerateRefreshTokenUseCase } from 'src/domain/jwt/usecase/generate-refresh-token.usecase';
import { GetUserRepoUseCase } from 'src/domain/github/usecase/get-user-repo.usecase';
import { CreateGitHookUseCase } from 'src/domain/github/usecase/create-git-hook.usecase';
import { GithubLoginUseCase } from 'src/domain/github/usecase/github-login.usecase';

//https://daemacoin-server.xquare.app
@Injectable()
export class AuthService {
  constructor(
    private readonly generateAccessTokenUseCase: GenerateAccessTokenUseCase,
    private readonly generateRefreshTokenUseCase: GenerateRefreshTokenUseCase,
    private readonly getUserRepoUseCase: GetUserRepoUseCase,
    private readonly createGitHookUseCase: CreateGitHookUseCase,
    private readonly githubLoginUseCase: GithubLoginUseCase,
  ) {}

  private async generateAccessToken(userId: string): Promise<TokensResponse> {
    const accessToken = (await this.generateAccessTokenUseCase.execute(userId))
      .token;
    const refreshToken = (
      await this.generateRefreshTokenUseCase.execute(userId)
    ).token;

    return new TokensResponse(accessToken, refreshToken);
  }

  // OAuth link타고 여기로 옴
  async oauthGithub(code: string) {
    const gitToken = await this.githubLoginUseCase.execute(code);
    const gitAccessToken = gitToken.accessToken;

    (await this.getUserRepoUseCase.execute(gitAccessToken)).repos.forEach(
      (value) => {
        this.createGitHookUseCase.execute(gitAccessToken, value);
      },
    );

    return code;
  }
}
