import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.oauthGithub(code);
  }

  @Post('/empty')
  empty(@Request() req) {
    console.log('\n---RES---\n');
    console.log(req);
    console.log('\n---RES_BODY---\n');
    console.log(req.body);
    console.log('\n-----\n');
    // console.log(req.body.commits);
    // console.log('\n---RES_BODY_COMMITS---\n');

    return true;
  }
}
