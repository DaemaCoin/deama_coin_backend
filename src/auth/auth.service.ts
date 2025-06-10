import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginRequest } from './dto/request/login.request';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterRequest } from './dto/request/register.request';
import { JwtService } from '@nestjs/jwt';
import { RegisterException } from 'src/exception/custom-exception/register.exception';
import { GithubService } from './github.service';
import { XquareService } from './xquare.service';
import { TokensResponse } from './dto/response/token.response';
import { EnvKeys } from 'src/common/env.keys';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly githubService: GithubService,
    private readonly xquareService: XquareService,
    private readonly walletService: WalletService,
  ) {}

  async generateTokens(userId: string) {
    const accessToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get(EnvKeys.JWT_SECRET),
        expiresIn: '6h',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get(EnvKeys.JWT_SECRET_RE),
        expiresIn: '7d',
      },
    );

    return new TokensResponse(accessToken, refreshToken);
  }

  async githubOAuth(code: string) {
    const githubAccessToken = await this.githubService.githubLogin(code);
    const githubUserId = await this.githubService.getGithubUser(githubAccessToken);

    const repos = await this.githubService.getUserRepo(githubAccessToken);
    await Promise.all(
      repos.map((repoName) =>
        this.githubService.createGitHook(githubAccessToken, repoName),
      ),
    );

    return githubUserId;
  }

  async xquarelogin(dto: LoginRequest) {
    const { accountId, password } = dto;
    const xquareId = await this.xquareService.xquarelogin(accountId, password);
    const user = await this.userRepository.findOne({
      where: { id: xquareId },
    });

    if (user) {
      return await this.generateTokens(user.id);
    }

    return { xquareId };
  }

  async register(dto: RegisterRequest) {
    const { xquareId, code } = dto;

    try {
      const findUser = await this.userRepository.findOne({
        where: { id: xquareId },
      });
      if (findUser) throw new RegisterException();

      const { id, image } = await this.githubOAuth(code);

      const user = await this.userRepository.save({
        id: xquareId,
        githubId: id,
        totalCoins: 0,
        githubImageUrl: image,
      });

      await this.walletService.createWallet(user.id);

      return await this.generateTokens(user.id);
    } catch (error) {
      await this.userRepository.delete(xquareId);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    return await this.userRepository.findOne({ where: { id: userId } });
  }
}

/*
  회원가입 로직

  1. Xqure Login - 여기서 XqureId 받기
  2. Github Login - 여기서 GithubId 받기
  3. Register - 이 2개 합쳐서 Regiser하기

  로그인 로직
  1. Xquare Login + User 조회, 둘다 존재하면 토큰
  2. 아니면 xqureId 출력
*/
