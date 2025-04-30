import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenFormatException } from '../exception/ws-custom-exception/invalid-token-format.exception';
import { EnvKeys } from '../enum/env-keys';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { IsPublic } from '../decorator/is-public';
import { RBAC } from '../decorator/rbac';
import { IsRefresh } from '../decorator/is-refresh';
import { Socket } from 'socket.io';
import { UserOrmEntity } from 'src/infrastructure/database/entity/user.orm-entity';
import { USER_ROLE } from '../enum/user-role';

export class WsJwtGuard implements CanActivate {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    if (this.reflector.get(IsPublic, context.getHandler())) {
      return true;
    }

    try {
      const rawToken = client.handshake.headers.authorization;

      if (!rawToken) throw new InvalidTokenFormatException();

      const [bearer, token] = rawToken.split(' ');
      if (bearer.toLowerCase() !== 'bearer')
        throw new InvalidTokenFormatException();

      const user = await this.userRepository.findOne({
        where: { email: this.jwtService.decode(token).email },
        select: ['email', 'role'],
      });
      if (!user) throw new InvalidTokenFormatException();

      const requiredRole = this.reflector.get<USER_ROLE>(RBAC, context.getHandler());
      if (requiredRole !== undefined && user.role > requiredRole) {
        throw new InvalidTokenFormatException();
      }

      const secretKey = this.reflector.get(IsRefresh, context.getHandler())
        ? this.configService.get(EnvKeys.JWT_SECRET_REFRESH)
        : this.configService.get(EnvKeys.JWT_SECRET);

      client.data.user = await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });
    } catch (err) {
      throw new InvalidTokenFormatException();
    }

    return true;
  }
}
