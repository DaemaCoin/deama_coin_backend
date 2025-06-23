import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: '사용자 ID', example: 'user123' })
  id: string;

  @ApiProperty({ description: 'GitHub ID', example: 'github_user' })
  githubId: string;

  @ApiProperty({ description: 'GitHub 프로필 이미지 URL', example: 'https://avatars.githubusercontent.com/u/12345678?v=4' })
  githubImageUrl: string;

  @ApiProperty({ description: '총 커밋 수', example: 150 })
  totalCommits: number;

  @ApiProperty({ description: '오늘 채굴한 코인 수', example: 15 })
  dailyCoinAmount: number;

  @ApiProperty({ description: '마지막 코인 채굴 날짜', example: '2024-01-15' })
  lastCoinDate: Date;
}

export class PaginationDto {
  @ApiProperty({ description: '현재 페이지 번호', example: 0 })
  page: number;

  @ApiProperty({ description: '페이지당 항목 수', example: 20 })
  take: number;

  @ApiProperty({ description: '전체 항목 수', example: 100 })
  total: number;

  @ApiProperty({ description: '전체 페이지 수', example: 5 })
  totalPages: number;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
  hasNext: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부', example: false })
  hasPrev: boolean;
}

export class UsersResponseDto {
  @ApiProperty({ description: '사용자 목록', type: [UserInfoDto] })
  users: UserInfoDto[];

  @ApiProperty({ description: '페이지네이션 정보', type: PaginationDto })
  pagination: PaginationDto;
} 