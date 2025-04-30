import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: '이메일은 비어있을 수 없습니다.' })
  @IsEmail({}, { message: '이메일 형식으로 입력해주세요.' })
  email: string;

  @IsString()
  @Length(8, 25, { message: '비밀번호는 8~25자 사이로 입력해주세요.' })
  @IsNotEmpty({ message: '비밀번호는 비어있을 수 없습니다.' })
  password: string;
}
