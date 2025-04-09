import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from 'src/application/auth/auth.service';
import { JWT_REPOSITORY_TOKEN } from 'src/domain/jwt/repository/jwt.repository.interface';
import { JwtRepositoryImpl } from 'src/infrastructure/jwt/repository/jwt.repository-impl';
import { GenerateAccessTokenUseCase } from 'src/domain/jwt/usecase/generate-access-token.usecase';
import { GenerateRefreshTokenUseCase } from 'src/domain/jwt/usecase/generate-refresh-token.usecase';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GenerateAccessTokenUseCase,
    GenerateRefreshTokenUseCase,
    {
      provide: JWT_REPOSITORY_TOKEN,
      useClass: JwtRepositoryImpl,
    },
  ],
})
export class AuthModule {}
