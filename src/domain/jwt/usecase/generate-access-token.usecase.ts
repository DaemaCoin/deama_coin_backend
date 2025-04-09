import { ConfigService } from '@nestjs/config';
import { Token } from '../model/tokens.model';
import {
  JWT_REPOSITORY_TOKEN,
  JwtRepository,
} from '../repository/jwt.repository.interface';
import { EnvKeys } from 'src/common/env.keys';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GenerateAccessTokenUseCase {
  constructor(
    private readonly configService: ConfigService,
    @Inject(JWT_REPOSITORY_TOKEN)
    private readonly jwtRepository: JwtRepository,
  ) {}

  async execute(userId: string): Promise<Token> {
    const accessToken = await this.jwtRepository.signToken({
      userId,
      secret: this.configService.get(EnvKeys.JWT_SECRET),
      expiresIn: '1h',
    });
    return accessToken;
  }
}
