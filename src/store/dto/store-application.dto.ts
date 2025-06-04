import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreApplicationDto {
  @ApiProperty({ description: '상점 이름', example: '맛있는 카페' })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({ description: '상점 소개', example: '신선한 원두로 내린 커피를 제공하는 카페입니다.' })
  @IsString()
  @IsNotEmpty()
  storeDescription: string;

  @ApiProperty({ description: '상점 사진 URL', example: 'https://example.com/store.jpg' })
  @IsString()
  @IsNotEmpty()
  storeImage: string;

  @ApiProperty({ description: '전화번호', example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class UpdateStoreApplicationStatusDto {
  @ApiProperty({ description: '승인/거절 상태', enum: ['APPROVED', 'REJECTED'], example: 'APPROVED' })
  @IsString()
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({ description: '거절 사유 (거절 시에만 필요)', required: false, example: '서류 불완전' })
  @IsString()
  rejectionReason?: string;
} 