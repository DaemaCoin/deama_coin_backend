import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EnvKeys } from '../enum/env-keys';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { IsPublic } from '../decorator/is-public';
import { RBAC } from '../decorator/rbac';
import { IsRefresh } from '../decorator/is-refresh';
import { UserOrmEntity } from 'src/infrastructure/database/entity/user.orm-entity';
import { InvalidTokenFormatException } from '../exception/custom-exception/invalid-token-format.exception';
import { USER_ROLE } from '../enum/user-role';
import { GetCacheUseCase } from 'src/domain/cache/get-cache.usecase';

export class JwtGuard implements CanActivate {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly getCacheUseCase: GetCacheUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const isRefresh = this.reflector.get(IsRefresh, context.getHandler());

    if (this.reflector.get(IsPublic, context.getHandler())) {
      return true;
    }

    try {
      const rawToken = req.headers.authorization;
      if (!rawToken) throw new InvalidTokenFormatException();

      const [bearer, token] = rawToken.split(' ');
      if (bearer.toLowerCase() !== 'bearer')
        throw new InvalidTokenFormatException();

      const secretKey = isRefresh
        ? this.configService.get(EnvKeys.JWT_SECRET_REFRESH)
        : this.configService.get(EnvKeys.JWT_SECRET);

      const payload = await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.data },
        select: ['id', 'role'],
      });
      if (!user) throw new InvalidTokenFormatException();

      const requiredRole = this.reflector.get<USER_ROLE>(RBAC, context.getHandler());
      if (requiredRole !== undefined && user.role > requiredRole) {
        throw new InvalidTokenFormatException();
      }

      const cacheRefToken = await this.getCacheUseCase.execute(`${user.id}_refresh`);
      if (
        isRefresh &&
        token !== cacheRefToken
      ) {
        throw new InvalidTokenFormatException();
      }

      req.user = user;
    } catch (err) {
      throw new InvalidTokenFormatException();
    }

    return true;
  }
}
