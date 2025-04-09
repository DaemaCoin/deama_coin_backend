import { Injectable } from '@nestjs/common';
import { TokensResponse } from 'src/presentation/auth/dto/response/tokens.response';
import { LoginRequestDto } from 'src/presentation/auth/dto/request/login.dto';
import { GenerateAccessTokenUseCase } from 'src/domain/jwt/usecase/generate-access-token.usecase';
import { GenerateRefreshTokenUseCase } from 'src/domain/jwt/usecase/generate-refresh-token.usecase';
import { GetUserRepoUseCase } from 'src/domain/github/usecase/get-user-repo.usecase';
import { CreateGitHookUseCase } from 'src/domain/github/usecase/create-git-hook.usecase';
import { GithubLoginUseCase } from 'src/domain/github/usecase/github-login.usecase';
import { GetXquareUserUsecCase } from 'src/domain/xquare/usecase/get-xquare-user.usecase';
import { LoginCommand } from 'src/domain/xquare/usecase/command/login.command';

@Injectable()
export class AuthService {
  constructor(
    private readonly generateAccessTokenUseCase: GenerateAccessTokenUseCase,
    private readonly generateRefreshTokenUseCase: GenerateRefreshTokenUseCase,
    private readonly getUserRepoUseCase: GetUserRepoUseCase,
    private readonly createGitHookUseCase: CreateGitHookUseCase,
    private readonly githubLoginUseCase: GithubLoginUseCase,
    private readonly getXquareUserUsecCase: GetXquareUserUsecCase,
  ) {}

  private async generateAccessToken(userId: string): Promise<TokensResponse> {
    const accessToken = (await this.generateAccessTokenUseCase.execute(userId))
      .token;
    const refreshToken = (
      await this.generateRefreshTokenUseCase.execute(userId)
    ).token;

    return new TokensResponse(accessToken, refreshToken);
  }

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

  async xquarelogin(dto: LoginRequestDto) {
    const command = new LoginCommand(dto.accountId, dto.password);

    const xquareUser = await this.getXquareUserUsecCase.execute(command);
    console.log(xquareUser);
  }
}
