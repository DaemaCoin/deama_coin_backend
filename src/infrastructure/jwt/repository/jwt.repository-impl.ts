import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/domain/jwt/model/tokens.model';
import { JwtRepository } from 'src/domain/jwt/repository/jwt.repository.interface';

@Injectable()
export class JwtRepositoryImpl implements JwtRepository {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(data: {
    userId: string;
    secret: string;
    expiresIn: string;
  }): Promise<Token> {
    const { userId, secret, expiresIn } = data;

    const token = await this.jwtService.signAsync(
      { userId },
      { secret, expiresIn },
    );

    return new Token(token);
  }
}
