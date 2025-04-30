import { Body, Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/request/login.request';
import { IsPublic } from '../common/decorator/is-public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.githubOAuth(code);
  }

  @IsPublic()
  @Get('/xquare')
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.xquarelogin(loginRequest);
  }
}
