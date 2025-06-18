import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { GetUserId } from 'src/common/decorator/get-user-id';

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
}
