import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/request/login.request';
import { IsPublic } from '../common/decorator/is-public';
import { RegisterRequest } from './dto/request/register.request';
import { GetUserId } from 'src/common/decorator/get-user-id';
import { WithdrawRequest } from './dto/request/withdraw.request';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'XQuare 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공, JWT 토큰 반환' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBody({ type: LoginRequest })
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

  @ApiOperation({ summary: '사용자 등록' })
  @ApiResponse({ status: 201, description: '사용자 등록 성공' })
  @ApiResponse({ status: 400, description: '등록 실패' })
  @ApiBody({ type: RegisterRequest })
  @IsPublic()
  @Post('/register')
  async regiser(@Body() registerRequest: RegisterRequest) {
    return await this.authService.register(registerRequest);
  }

  @ApiOperation({ summary: '유저 프로필 조회' })
  @ApiResponse({ status: 200, description: '유저 프로필 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Get('/user')
  async getUserProfile(@GetUserId() userId: string) {
    return await this.authService.getUserProfile(userId);
  }

  @ApiOperation({ summary: '유저 삭제, 등록된 webhook 삭제' })
  @ApiResponse({ status: 204, description: '(유저 삭제, 등록된 webhook 삭제) 삭제' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Delete('/withdraw')
  @HttpCode(HttpStatus.NO_CONTENT)
  async withdraw(@GetUserId() userId: string, @Body() withdrawReq: WithdrawRequest) {
    return await this.authService.withdraw(userId, withdrawReq);
  }
}
