import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/common/decorator/public';
import { AuthService } from 'src/application/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('/github')
  oauthGithub(@Query('code') code: string) {
    return this.authService.oauthGithub(code);
  }
}
