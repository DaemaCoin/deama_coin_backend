import { Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { GetCommitData } from 'src/common/decorator/get-commit-ids';
import { IsPublic } from 'src/common/decorator/is-public';
import { CoinService } from './coin.service';
import { GetUserId } from 'src/common/decorator/get-user-id';

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @ApiOperation({ summary: '커밋 웹훅 (코인 지급용)' })
  @ApiResponse({ status: 200, description: '커밋 처리 성공' })
  @IsPublic()
  @Post('/hook')
  getCommits(
    @GetCommitData() commitData: { fullName: string; commitIds: string[] },
  ) {
    const { fullName, commitIds } = commitData;
    return this.coinService.commitHook(fullName, commitIds);
  }

  @ApiOperation({
    summary: '코인 히스토리 조회',
    description: '지갑에서 코인 획득 및 사용 내역을 페이지 단위로 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '히스토리 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 0)',
  })
  @ApiBearerAuth()
  @Get('/history')
  async getCoinHistory(
    @GetUserId() userId: string,
    @Query('page') page: number,
  ) {
    return await this.coinService.getCoinHistory(userId, page);
  }

  @ApiOperation({
    summary: '오늘 채굴된 코인 개수 조회',
    description: '오늘 채굴된 총 코인 개수를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '오늘 채굴된 코인 개수 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Get('/today-mined')
  async getTodayMinedCoins(@GetUserId() userId: string) {
    return await this.coinService.getTodayMinedCoins(userId);
  }
}
