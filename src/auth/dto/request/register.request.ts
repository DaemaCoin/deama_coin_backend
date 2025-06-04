import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequest {
  @IsNotEmpty({ message: 'XquareId를 입력해주세요' })
  @IsString()
  xquareId: string;

  @IsNotEmpty({ message: 'Code를 입력해주세요' })
  @IsString()
  code: string;
}
