import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '상품 이름', example: '아메리카노' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '상품 설명', example: '깔끔한 맛의 아메리카노입니다.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: '상품 사진 URL', example: 'https://example.com/americano.jpg' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: '상품 가격', example: 4500 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;
}

export class UpdateProductDto {
  @ApiProperty({ description: '상품 이름', required: false, example: '아메리카노' })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: '상품 설명', required: false, example: '깔끔한 맛의 아메리카노입니다.' })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ description: '상품 사진 URL', required: false, example: 'https://example.com/americano.jpg' })
  @IsString()
  @IsNotEmpty()
  image?: string;

  @ApiProperty({ description: '상품 가격', required: false, example: 4500 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;
} 