import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequest {
  @ApiProperty({ description: 'XQuare 아이디', example: 'xquare123' })
  @IsNotEmpty({ message: 'XquareId를 입력해주세요' })
  @IsString()
  xquareId: string;

  @ApiProperty({ description: 'GitHub 코드', example: 'github_code_123' })
  @IsNotEmpty({ message: 'GithubID를 입력해주세요' })
  @IsString()
  code: string;
}
