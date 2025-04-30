import { Controller, Post, Request } from '@nestjs/common';
import { CoinService } from './coin.service';
import { IsPublic } from 'src/common/decorator/is-public';
import { GetCommitIds } from 'src/common/decorator/get-commit-ids';

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @IsPublic()
  @Post('/hook')
  getCommits(@GetCommitIds() ids: string[]) {
    console.log('\n---COMMITS---\n');
    console.log(ids);

    return true;
  }
}
