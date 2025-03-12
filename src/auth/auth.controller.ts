import { Controller, Get, Logger, Post, Query, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    let i = 0;
  }

  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.oauthGithub(code);
  }

  @Post('/empty')
  empty(@Request() req) {
    console.log("-----\n");
    console.log(req.body);
    console.log("\n-----\n");
    console.log(req.body.commits);
    console.log("\n-----\n");
    
    return true;
  }
}
