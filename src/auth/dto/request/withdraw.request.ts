import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawRequest {
  @ApiProperty({ description: 'GitHub 코드', example: 'github_code_123' })
  @IsNotEmpty({ message: 'GithubID를 입력해주세요' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'HookUrl (일부도 가능)',
    example: 'https://${server_url}',
  })
  @IsNotEmpty({ message: 'HookUrl을 입력해주세요' })
  @IsString()
  hookUrl: string;
}
