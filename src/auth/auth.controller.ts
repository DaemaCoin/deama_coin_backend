import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/request/login.request';
import { Public } from 'src/common/decorator/public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.oauthGithub(code);
  }

  @Public()
  @Get('/login')
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.login(loginRequest);
  }
}
