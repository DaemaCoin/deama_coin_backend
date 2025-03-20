import { Body, Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/request/login.request';
import { Public } from 'src/common/decorator/public';
import { IsRefresh } from 'src/common/decorator/is-refresh';
import { GetUserId } from 'src/common/decorator/get-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.oauthGithub(code);
  }

  @Public()
  @Get('/login')
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.login(loginRequest);
  }

  @IsRefresh()
  @Get('re-issue')
  reIssue(@GetUserId() userId: string) {
    return this.authService.reIssue(userId);
  }
}
