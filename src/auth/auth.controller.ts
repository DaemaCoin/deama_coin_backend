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
    return code;
  }

  @IsPublic()
  @Post('/xquare')
  async login(@Body() loginRequest: LoginRequest) {
    return await this.authService.xquarelogin(loginRequest);
  }

  @IsPublic()
  @Post('/register')
  async regiser(@Body() registerRequest: RegisterRequest) {
    return await this.authService.register(registerRequest);
  }
}
