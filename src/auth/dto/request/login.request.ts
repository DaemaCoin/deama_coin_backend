import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({ description: '계정 아이디', example: 'user123' })
  @IsNotEmpty({ message: '아이디를 입력해주세요' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @IsString()
  password: string;
}
