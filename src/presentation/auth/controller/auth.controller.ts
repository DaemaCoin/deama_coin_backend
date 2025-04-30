import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/application/auth/auth.service';
import { RegisterRequest } from '../dto/request/register.request';
import { IsPublic } from 'src/common/decorator/is-public';
import { LoginRequest } from '../dto/request/login.reqeust';
import { IsRefresh } from 'src/common/decorator/is-refresh';
import { GetUserId } from 'src/common/decorator/get-user-id';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('register')
  async register(@Body() registerRequest: RegisterRequest) {
    return await this.authService.register(registerRequest);
  }

  @IsPublic()
  @Post('login')
  async login(@Body() loginRequest: LoginRequest) {
    return await this.authService.login(loginRequest);
  }

  @IsRefresh()
  @Post('re-issue')
  reissue(@GetUserId() userId: string) {
    return this.authService.reIssue(userId);
  }
}
