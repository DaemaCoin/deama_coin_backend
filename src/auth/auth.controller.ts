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
    console.log(req);
  }
}
