import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from 'src/application/auth/auth.service';
import { JWT_REPOSITORY_TOKEN } from 'src/domain/jwt/repository/jwt.repository.interface';
import { JwtRepositoryImpl } from 'src/infrastructure/jwt/repository/jwt.repository-impl';
import { GenerateAccessTokenUseCase } from 'src/domain/jwt/usecase/generate-access-token.usecase';
import { GenerateRefreshTokenUseCase } from 'src/domain/jwt/usecase/generate-refresh-token.usecase';
import { GITHUB_REPOSITORY_TOKEN } from 'src/domain/github/repository/github.repository.interface';
import { GithubRepositoryImpl } from 'src/infrastructure/api/github/repository/github.repository-impl';
import { CreateGitHookUseCase } from 'src/domain/github/usecase/create-git-hook.usecase';
import { GetUserRepoUseCase } from 'src/domain/github/usecase/get-user-repo.usecase';
import { GithubLoginUseCase } from 'src/domain/github/usecase/github-login.usecase';
import { XQUARE_REPOSITORY_TOKEN } from 'src/domain/xquare/repository/xquare.repository.interface';
import { XquareRepositoryImpl } from 'src/infrastructure/api/xquare/repository/xquare.repository-impl';
import { GetXquareUserUsecCase } from 'src/domain/xquare/usecase/get-xquare-user.usecase';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: JWT_REPOSITORY_TOKEN,
      useClass: JwtRepositoryImpl,
    },
    GenerateAccessTokenUseCase,
    GenerateRefreshTokenUseCase,
    {
      provide: GITHUB_REPOSITORY_TOKEN,
      useClass: GithubRepositoryImpl,
    },
    GetUserRepoUseCase,
    CreateGitHookUseCase,
    GithubLoginUseCase,
    {
      provide: XQUARE_REPOSITORY_TOKEN,
      useClass: XquareRepositoryImpl,
    },
    GetXquareUserUsecCase,
  ],
})
export class AuthModule {}
