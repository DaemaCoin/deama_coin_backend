import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardResponseDto } from './dto/leaderboard.dto';
import { IsPublic } from '../common/decorator/is-public';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @ApiOperation({
    summary: '코인 리더보드 조회',
    description:
      '사용자들의 코인 보유량을 기준으로 한 리더보드를 조회합니다. 순위, 프로필 이미지, 코인 수, GitHub ID가 포함됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리더보드 조회 성공',
    type: LeaderboardResponseDto,
  })
  @IsPublic()
  @Get()
  async getLeaderboard(): Promise<LeaderboardResponseDto> {
    return await this.leaderboardService.getLeaderboard();
  }
}
