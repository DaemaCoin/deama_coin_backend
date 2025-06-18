import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferRequest {
  @ApiProperty({ description: '받을 사용자 아이디', example: 'user456' })
  @IsNotEmpty({ message: '보낼 아이디를 확인해 주세요' })
  @IsString()
  to: string;

  @ApiProperty({ description: '전송할 금액', example: 1000, type: Number })
  @IsNotEmpty({ message: '얼마를 보낼지 확인해 주세요' })
  @IsNumber({}, { message: '숫자 형식으로 입력해 주세요' })
  amount: number;
}
