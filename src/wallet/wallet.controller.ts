import { Controller, Post, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { IsPublic } from 'src/common/decorator/is-public';
import { GetCommitIds } from 'src/common/decorator/get-commit-ids';

@Controller('coin')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @IsPublic()
  @Post('/hook')
  getCommits(@GetCommitIds() ids: string[]) {
    console.log('\n---COMMITS---\n');
    console.log(ids);

    return true;
  }
}
