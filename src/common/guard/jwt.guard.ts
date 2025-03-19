import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenFormatException } from 'src/exception/custom-exception/invalid-token-format.exception';
import { EnvKeys } from '../env.keys';
import { Public } from '../decorator/public';
import { IsRefresh } from '../decorator/is-refresh';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const isPublic = this.reflector.get(Public, context.getHandler());
    const isRefresh = this.reflector.get(IsRefresh, context.getHandler());

    if (isPublic) {
      return true;
    }

    try {
      const rawToken = req.headers.authorization;
      const [bearer, token] = rawToken.split(' ');

      if (bearer.toLowerCase() !== 'bearer')
        throw new InvalidTokenFormatException();

      if (isRefresh) {
        req.user = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get(EnvKeys.JWT_SECRET_RE),
        });
      } else {
        req.user = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get(EnvKeys.JWT_SECRET),
        });
      }
    } catch (err) {
      throw new InvalidTokenFormatException();
    }

    return true;
  }
}
