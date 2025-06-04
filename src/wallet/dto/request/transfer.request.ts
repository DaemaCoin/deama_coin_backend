import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TransferRequest {
  @IsNotEmpty({ message: '보낼 아이디를 확인해 주세요' })
  @IsString()
  to: string;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: '얼마를 보낼지 확인해 주세요' })
  @IsNumber()
  amount: string;
}
