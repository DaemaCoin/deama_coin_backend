import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { GetUserId } from 'src/common/decorator/get-user-id';
import { TransferRequest } from './dto/request/transfer.request';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

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
}
