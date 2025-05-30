import { Controller, Get, Post, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { IsPublic } from 'src/common/decorator/is-public';
import { GetCommitIds } from 'src/common/decorator/get-commit-ids';
import { GetUserId } from 'src/common/decorator/get-user-id';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @IsPublic()
  @Post('/hook')
  getCommits(@GetCommitIds() ids: string[]) {
    console.log('\n---COMMITS---\n');
    console.log(ids);

    return true;
  }

  @Get()
  async getWallet(@GetUserId() userId: string) {
    return await this.walletService.getWallet(userId);
  }
}
