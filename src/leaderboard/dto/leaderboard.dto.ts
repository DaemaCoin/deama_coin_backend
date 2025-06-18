import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardItemDto {
  @ApiProperty({ description: '순위', example: 1 })
  rank: number;

  @ApiProperty({
    description: 'GitHub 프로필 이미지 URL',
    example: 'https://avatars.githubusercontent.com/u/12345?v=4',
  })
  profileImageUrl: string;

  @ApiProperty({ description: '총 코인 수', example: 1250 })
  totalCoins: number;

  @ApiProperty({ description: 'GitHub ID', example: 'john_doe' })
  githubId: string;
}

export class LeaderboardResponseDto {
  @ApiProperty({
    description: '리더보드 항목들',
    type: [LeaderboardItemDto],
  })
  items: LeaderboardItemDto[];
}
