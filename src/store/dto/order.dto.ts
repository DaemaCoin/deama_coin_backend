import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: '상품 ID', example: 1 })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ description: '수량', example: 2 })
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'QR에서 가져온 사용자 지갑 ID', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  userId: string; // QR에서 가져온 사용자 ID

  @ApiProperty({ 
    description: '주문 상품 목록',
    type: [OrderItemDto],
    example: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
} 