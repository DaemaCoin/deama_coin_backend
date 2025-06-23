import { Controller, Post, Get, Body, Param, UseGuards, Request, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreApplicationDto } from './dto/store-application.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { CreateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';
import { IsPublic } from 'src/common/decorator/is-public';
import { GetStoreId } from 'src/common/decorator/get-store-id';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 입점 신청 (누구나 접근 가능)
  @ApiOperation({ summary: '상점 입점 신청' })
  @ApiResponse({ status: 201, description: '입점 신청 성공' })
  @ApiResponse({ status: 400, description: '이미 대기 중인 신청이 있음' })
  @ApiBody({ type: CreateStoreApplicationDto })
  @IsPublic()
  @Post('apply')
  async applyStore(@Body() dto: CreateStoreApplicationDto) {
    return this.storeService.applyStore(dto);
  }

  // 상점 로그인 (누구나 접근 가능)
  @ApiOperation({ summary: '상점 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공, JWT 토큰 반환' })
  @ApiResponse({ status: 400, description: '잘못된 로그인 정보' })
  @ApiBody({ type: StoreLoginDto })
  @IsPublic()
  @Post('login')
  async login(@Body() dto: StoreLoginDto) {
    return this.storeService.login(dto);
  }

  // 상품 추가 (상점 JWT 필요)
  @ApiOperation({ summary: '상품 추가' })
  @ApiResponse({ status: 201, description: '상품 추가 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateProductDto })
  @Post('products')
  async createProduct(@GetStoreId() storeId: number, @Body() dto: CreateProductDto) {
    return this.storeService.createProduct(storeId, dto);
  }

  // 내 상품 목록 조회 (상점 JWT 필요)
  @ApiOperation({ summary: '내 상품 목록 조회' })
  @ApiResponse({ status: 200, description: '상품 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Get('my-products')
  async getMyProducts(@GetStoreId() storeId: number) {
    return this.storeService.getMyProducts(storeId);
  }

  // 상점 상품 목록 조회 (고객용, 누구나 접근 가능)
  @ApiOperation({ summary: '상점 상품 목록 조회 (고객용)' })
  @ApiResponse({ status: 200, description: '상품 목록 조회 성공' })
  @ApiParam({ name: 'storeId', description: '상점 ID' })
  @IsPublic()
  @Get(':storeId/products')
  async getStoreProducts(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.storeService.getStoreProducts(storeId);
  }

  // 주문 생성 (누구나 접근 가능 - QR 스캔용)
  @ApiOperation({ summary: '주문 생성 (QR 스캔 후)' })
  @ApiResponse({ status: 201, description: '주문 생성 성공' })
  @ApiResponse({ status: 400, description: '잔액 부족 또는 상품 없음' })
  @ApiParam({ name: 'storeId', description: '상점 ID' })
  @ApiBody({ type: CreateOrderDto })
  @IsPublic()
  @Post(':storeId/orders')
  async createOrder(@Param('storeId', ParseIntPipe) storeId: number, @Body() dto: CreateOrderDto) {
    return this.storeService.createOrder(storeId, dto);
  }

  // 내 주문 목록 조회 (상점 JWT 필요)
  @ApiOperation({ summary: '내 주문 목록 조회' })
  @ApiResponse({ status: 200, description: '주문 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Get('my-orders')
  async getMyOrders(@GetStoreId() storeId: number) {
    return this.storeService.getMyOrders(storeId);
  }

  // 주문 완료 처리 (상점 JWT 필요)
  @ApiOperation({ summary: '주문 완료 처리' })
  @ApiResponse({ status: 200, description: '주문 완료 처리 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
  @ApiBearerAuth()
  @ApiParam({ name: 'orderId', description: '주문 ID' })
  @Post('orders/:orderId/complete')
  async completeOrder(@GetStoreId() storeId: number, @Param('orderId', ParseIntPipe) orderId: number) {
    return this.storeService.completeOrder(storeId, orderId);
  }
} 