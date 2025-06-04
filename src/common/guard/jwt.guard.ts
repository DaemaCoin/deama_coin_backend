import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenFormatException } from 'src/exception/custom-exception/invalid-token-format.exception';
import { EnvKeys } from '../env.keys';
import { IsRefresh } from '../decorator/is-refresh';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IsPublic } from '../decorator/is-public';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const isPublic = await this.reflector.get(IsPublic, context.getHandler());
    const isPublicNew = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isRefresh = this.reflector.get(IsRefresh, context.getHandler());

    if (isPublic || isPublicNew) {
      return true;
    }

    try {
      const rawToken = req.headers.authorization;
      const [bearer, token] = rawToken.split(' ');

      if (bearer.toLowerCase() !== 'bearer')
        throw new InvalidTokenFormatException();

      if (isRefresh) {
        const { userId } = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get(EnvKeys.JWT_SECRET_RE),
        });

        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (!user) throw new InvalidTokenFormatException();
        req.user = userId;
      } else {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get(EnvKeys.JWT_SECRET),
        });

        if (payload.userId) {
          const user = await this.userRepository.findOne({
            where: { id: payload.userId },
          });
          if (!user) throw new InvalidTokenFormatException();
          req.user = payload.userId;
        } else if (payload.storeId) {
          req.user = payload;
        } else {
          throw new InvalidTokenFormatException();
        }
      }
    } catch (err) {
      throw new InvalidTokenFormatException();
    }

    return true;
  }
}
