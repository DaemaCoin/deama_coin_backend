import { Controller, Post, Request } from '@nestjs/common';
import { CoinService } from './coin.service';
import { IsPublic } from 'src/common/decorator/is-public';

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @IsPublic()
  @Post('/hook')
  getCommits(@Request() req: any) {
    console.log('\n---COMMITS---\n');
    console.log(req.body);

    // console.log(commitIds);

    return true;
  }
}
