import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: '아이디를 입력해주세요' })
  @IsString()
  accountId: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @IsString()
  password: string;
}
