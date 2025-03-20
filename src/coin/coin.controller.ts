import { Controller, Post, Request } from '@nestjs/common';
import { CoinService } from './coin.service';
import { GetCommitIds } from 'src/common/decorator/get-commitids';
import { Public } from 'src/common/decorator/public';

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Public()
  @Post('/hook')
  empty(@GetCommitIds() commitIds: string[]) {
    console.log('\n---COMMITS---\n');
    console.log(commitIds);

    return true;
  }
}
