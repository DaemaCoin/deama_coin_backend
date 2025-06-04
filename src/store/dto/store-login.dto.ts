import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StoreLoginDto {
  @ApiProperty({ description: '상점 아이디 (상점 이름)', example: '맛있는 카페' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ description: '비밀번호 (상점 이름을 base64로 인코딩)', example: 'TWFzdGlzdW4gS2FmZQ==' })
  @IsString()
  @IsNotEmpty()
  password: string;
} 