import { ConfigService } from '@nestjs/config';
import { Token } from '../model/tokens.model';
import {
  JWT_REPOSITORY_TOKEN,
  JwtRepository,
} from '../repository/jwt.repository.interface';
import { EnvKeys } from 'src/common/env.keys';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GenerateRefreshTokenUseCase {
  constructor(
    private readonly configService: ConfigService,
    @Inject(JWT_REPOSITORY_TOKEN)
    private readonly jwtRepository: JwtRepository,
  ) {}

  async execute(userId: string): Promise<Token> {
    const refreshToken = await this.jwtRepository.signToken({
      userId,
      secret: this.configService.get(EnvKeys.JWT_SECRET_RE),
      expiresIn: '7d',
    });
    return refreshToken;
  }
}
