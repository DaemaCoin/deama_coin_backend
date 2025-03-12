import { Controller, Get, Post, Query, Response } from '@nestjs/common';
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
  empty(@Response() res) {
    console.log("-----\n");
    console.log(res.body);
    console.log("\n-----\n");
    console.log(res.body.commits);
    console.log("\n-----\n");
    
    return true;
  }
}
