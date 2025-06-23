import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginRequest } from './dto/request/login.request';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterRequest } from './dto/request/register.request';
import { JwtService } from '@nestjs/jwt';
import { RegisterException } from 'src/exception/custom-exception/register.exception';
import { XquareService } from './xquare.service';
import { TokensResponse } from './dto/response/token.response';
import { EnvKeys } from 'src/common/env.keys';
import { WalletService } from 'src/wallet/wallet.service';
import { GithubService } from 'src/github/github.service';
import { GithubRepoI } from 'src/common/interface/git-repo.interface';
import { GithubHookI } from 'src/common/interface/git-hook.interface';
import { WithdrawRequest } from './dto/request/withdraw.request';
import { CoinEntity } from 'src/coin/entity/coin.entity';
import { Not } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoinEntity)
    private readonly coinRepository: Repository<CoinEntity>,
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
    const githubUserId =
      await this.githubService.getGithubUser(githubAccessToken);

    const getReposPromises = [1, 2, 3, 4].map((page) =>
      this.githubService.getUserRepo(githubAccessToken, page),
    );
    const getReposResultsSettled = await Promise.allSettled(getReposPromises);
    const getReposResults = getReposResultsSettled
      .filter((result) => {
        if (result.status === 'rejected') {
          console.error('Repo fetch 실패:', result.reason);
          return false;
        }
        return true;
      })
      .map((result) => (result.status === 'fulfilled' ? result.value : []));
    const allRepos = getReposResults.flat();

    const writableRepos = allRepos.filter((repo) => repo.permissions.push);
    const hookResults = await Promise.allSettled(
      writableRepos.map((repoInfo: GithubRepoI) =>
        this.githubService.createGitHook(githubAccessToken, repoInfo.full_name),
      ),
    );
    hookResults.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(`웹훅 생성 실패: ${writableRepos[idx].full_name}`, result.reason);
      }
    });

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
    const INIT_BALENCE = 200
    const { xquareId, code } = dto;

    try {
      const findUser = await this.userRepository.findOne({
        where: { id: xquareId },
      });
      if (findUser) throw new RegisterException();

      const { id, image } = await this.githubOAuth(code);

      await this.userRepository.save({
        id: xquareId,
        githubId: id,
        totalCommits: 0,
        githubImageUrl: image,
      });

      await this.walletService.createWallet(xquareId, INIT_BALENCE);

      const encodedId = `owner_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      await this.coinRepository.save({
        id: encodedId,
        message: '초기 코인 지급',
        repoName: 'Start',
        user: { id: xquareId },
        amount: INIT_BALENCE,
      });

      return await this.generateTokens(xquareId);
    } catch (error) {
      await this.coinRepository.delete({ user: { id: xquareId } });
      await this.userRepository.delete(xquareId);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async getOtherUsers(userId: string, page: number = 0) {
    const take = 20;
    const skip = page * take;

    const [users, total] = await this.userRepository.findAndCount({
      where: { id: Not(userId) }, // 본인 제외
      select: {
        id: true,
        githubId: true,
        githubImageUrl: true,
        totalCommits: true,
        dailyCoinAmount: true,
        lastCoinDate: true,
      },
      order: { totalCommits: 'DESC' }, // 총 커밋 수로 정렬
      skip,
      take,
    });

    return {
      users,
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
        hasNext: skip + take < total,
        hasPrev: page > 0,
      },
    };
  }

  async withdraw(userId: string, withdrawReq: WithdrawRequest) {
    const {code, hookUrl} = withdrawReq;
    const githubAccessToken = await this.githubService.githubLogin(code);

    const getReposPromises = [1, 2, 3, 4].map((page) =>
      this.githubService.getUserRepo(githubAccessToken, page),
    );
    const getReposResults = await Promise.all(getReposPromises);
    const allRepos = getReposResults.flat();

    await Promise.all(
      allRepos.map(async (repoInfo: GithubRepoI) => {
        const hookInfos: GithubHookI[] = await this.githubService.getRepoHooks(
          githubAccessToken,
          repoInfo.full_name,
        );

        if (Array.isArray(hookInfos) && hookInfos.length > 0) {
          hookInfos.map(async (v) => {
            if (v.config.url == hookUrl) {
              console.log(v.url);
              await this.githubService.deleteGitHook(githubAccessToken, v.url);
            }
          });
        }
      }),
    );

    await this.coinRepository.delete({ user: { id: userId } });
    await this.userRepository.delete({ id: userId });
  }
}