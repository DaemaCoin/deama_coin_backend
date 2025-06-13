import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class LeaderboardQueryDto {
  @ApiProperty({ 
    description: '페이지 번호 (0부터 시작)', 
    example: 0, 
    required: false,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  page?: number = 0;

  @ApiProperty({ 
    description: '페이지당 항목 수', 
    example: 10, 
    required: false,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class LeaderboardItemDto {
  @ApiProperty({ description: '순위', example: 1 })
  rank: number;

  @ApiProperty({ description: 'GitHub 프로필 이미지 URL', example: 'https://avatars.githubusercontent.com/u/12345?v=4' })
  profileImageUrl: string;

  @ApiProperty({ description: '총 코인 수', example: 1250 })
  totalCoins: number;

  @ApiProperty({ description: 'GitHub ID', example: 'john_doe' })
  githubId: string;
}

export class LeaderboardResponseDto {
  @ApiProperty({ 
    description: '리더보드 항목들',
    type: [LeaderboardItemDto]
  })
  items: LeaderboardItemDto[];

  @ApiProperty({ description: '현재 페이지', example: 0 })
  currentPage: number;

  @ApiProperty({ description: '페이지당 항목 수', example: 10 })
  pageSize: number;

  @ApiProperty({ description: '전체 사용자 수', example: 150 })
  totalUsers: number;

  @ApiProperty({ description: '전체 페이지 수', example: 15 })
  totalPages: number;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
  hasNext: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부', example: false })
  hasPrevious: boolean;
} 