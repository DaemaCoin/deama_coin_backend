import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { IsPublic } from 'src/common/decorator/is-public';
import { GetCommitData } from 'src/common/decorator/get-commit-ids';
import { GetUserId } from 'src/common/decorator/get-user-id';
import { TransferRequest } from './dto/request/transfer.request';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: '커밋 웹훅 (코인 지급용)' })
  @ApiResponse({ status: 200, description: '커밋 처리 성공' })
  @IsPublic()
  @Post('/hook')
  getCommits(
    @GetCommitData() commitData: { fullName: string; commitIds: string[] },
  ) {
    const { fullName, commitIds } = commitData;
    return this.walletService.commitHook(fullName, commitIds);
  }

  @ApiOperation({ summary: '지갑 정보 조회' })
  @ApiResponse({ status: 200, description: '지갑 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '지갑을 찾을 수 없음' })
  @ApiBearerAuth()
  @Get()
  async getWallet(@GetUserId() userId: string) {
    return await this.walletService.getWallet(userId);
  }

  @ApiOperation({ summary: '코인 전송' })
  @ApiResponse({ status: 200, description: '전송 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 400, description: '전송 실패 (잔액 부족 등)' })
  @ApiBearerAuth()
  @ApiBody({ type: TransferRequest })
  @Post('/transfer')
  async transfer(
    @GetUserId() userId: string,
    @Body() transferRequest: TransferRequest,
  ) {
    return await this.walletService.transfer(userId, transferRequest);
  }

  @ApiOperation({ summary: '코인 히스토리 조회', description: '지갑에서 코인 획득 및 사용 내역을 페이지 단위로 조회합니다.' })
  @ApiResponse({ status: 200, description: '히스토리 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 0)' })
  @ApiBearerAuth()
  @Get('/history')
  async getCoinHistory(
    @GetUserId() userId: string,
    @Query('page') page: number,
  ) {
    return await this.walletService.getCoinHistory(userId, page);
  }
}
