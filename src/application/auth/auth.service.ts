import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EnvKeys } from 'src/common/enum/env-keys';
import { UserAlreadyExistsException } from 'src/common/exception/custom-exception/user-already-exists.exception.ts';
import { SetCacheUseCase } from 'src/domain/cache/set-cache.usecase';
import { FindOneUserUseCase } from 'src/domain/user/usecase/find-one-user.usecase';
import { SaveUserUseCase } from 'src/domain/user/usecase/save-user.usecase';
import { RegisterRequest } from 'src/presentation/auth/dto/request/register.request';
import { TokensResponse } from 'src/presentation/auth/dto/response/tokens.response';
import * as bcrypt from 'bcrypt';
import { LoginRequest } from 'src/presentation/auth/dto/request/login.reqeust';
import { LoginFailException } from 'src/common/exception/custom-exception/login-fail.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly setCacheUseCase: SetCacheUseCase,

    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly saveUserUseCase: SaveUserUseCase,
  ) {}

  private async generateToken(id: string) {
    const payload = { data: id };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get(EnvKeys.JWT_SECRET),
      expiresIn: '10h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get(EnvKeys.JWT_SECRET_REFRESH),
      expiresIn: '7d',
    });

    await this.setCacheUseCase.execute(`${id}_refresh`, refreshToken, 604800);

    return new TokensResponse(accessToken, refreshToken);
  }

  async register(dto: RegisterRequest) {
    const { email, password, nickname } = dto;

    const existingUser = await this.findOneUserUseCase.execute({ email });
    if (existingUser) throw new UserAlreadyExistsException();

    const salt = this.configService.get(EnvKeys.PASSWORD_SALT)!;
    const user = await this.saveUserUseCase.execute({
      email,
      password: await bcrypt.hash(password, salt),
      nickname,
    });

    return await this.generateToken(user.id);
  }

  async login(loginRequest: LoginRequest) {
    const { email, password } = loginRequest;

    const user = await this.findOneUserUseCase.execute({ email });
    if (!user) throw new LoginFailException();

    if (!(await bcrypt.compare(password, user.password))) {
      throw new LoginFailException();
    }

    return await this.generateToken(user.id);
  }

  async reIssue(id: string) {
    return await this.generateToken(id);
  }
}
