import { Injectable } from '@nestjs/common';
import { TokensResponse } from 'src/presentation/auth/dto/response/tokens.response';
import { GenerateAccessTokenUseCase } from 'src/domain/jwt/usecase/generate-access-token.usecase';
import { GenerateRefreshTokenUseCase } from 'src/domain/jwt/usecase/generate-refresh-token.usecase';

@Injectable()
export class AuthService {
  constructor(
    private readonly generateAccessTokenUseCase: GenerateAccessTokenUseCase,
    private readonly generateRefreshTokenUseCase: GenerateRefreshTokenUseCase,
  ) {}

  private async generateAccessToken(userId: string): Promise<TokensResponse> {
    const accessToken = (await this.generateAccessTokenUseCase.execute(userId))
      .token;
    const refreshToken = (
      await this.generateRefreshTokenUseCase.execute(userId)
    ).token;

    return new TokensResponse(accessToken, refreshToken);
  }
}
