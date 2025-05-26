import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/request/login.request';
import { IsPublic } from '../common/decorator/is-public';
import { RegisterRequest } from './dto/request/register.request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.githubOAuth(code);
  }

  @IsPublic()
  @Post('/xquare')
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.xquarelogin(loginRequest);
  }

  @IsPublic()
  @Post('/register')
  regiser(@Body() registerRequest: RegisterRequest) {
    return this.authService.register(registerRequest);
  }
}
