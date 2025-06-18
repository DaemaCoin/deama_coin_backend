import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entity/user.entity';
import { LeaderboardResponseDto, LeaderboardItemDto } from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

   async getLeaderboard(page: number = 0, limit: number = 10): Promise<LeaderboardResponseDto> {
    // 사용자별 총 코인 수 집계 쿼리 (순위 포함)
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.coins', 'coin')
      .select('user.id', 'userId')
      .addSelect('user.githubId', 'githubId')
      .addSelect('user.githubImageUrl', 'profileImageUrl')
      .addSelect('COALESCE(SUM(coin.amount), 0)', 'totalCoins')
      .addSelect('RANK() OVER (ORDER BY COALESCE(SUM(coin.amount), 0) DESC)', 'rank')
      .groupBy('user.id')
      .addGroupBy('user.githubId')
      .addGroupBy('user.githubImageUrl')
      .orderBy('totalCoins', 'DESC');

    // 전체 사용자 수 계산
    const totalUsers = await this.userRepository.count();

    // 페이지네이션 적용된 결과 조회
    const rawResults = await queryBuilder
      .offset(page * limit)
      .limit(limit)
      .getRawMany();

    // 결과를 DTO로 변환 (실제 순위 사용)
    const items: LeaderboardItemDto[] = rawResults.map((result) => ({
      rank: parseInt(result.rank),
      profileImageUrl: result.profileImageUrl,
      totalCoins: parseInt(result.totalCoins) || 0,
      githubId: result.githubId,
    }));

    // 페이지네이션 메타데이터 계산
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      items,
      currentPage: page,
      pageSize: limit,
      totalUsers,
      totalPages,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };
  }
} 