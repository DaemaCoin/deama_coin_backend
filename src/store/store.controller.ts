import { Controller, Post, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreApplicationDto } from './dto/store-application.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { CreateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';
import { JwtGuard } from '../common/guard/jwt.guard';
import { Public } from '../common/decorator/public.decorator';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 입점 신청 (누구나 접근 가능)
  @ApiOperation({ summary: '상점 입점 신청' })
  @ApiResponse({ status: 201, description: '입점 신청 성공' })
  @ApiResponse({ status: 400, description: '이미 대기 중인 신청이 있음' })
  @ApiBody({ type: CreateStoreApplicationDto })
  @Public()
  @Post('apply')
  async applyStore(@Body() dto: CreateStoreApplicationDto) {
    return this.storeService.applyStore(dto);
  }

  // 상점 로그인 (누구나 접근 가능)
  @ApiOperation({ summary: '상점 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공, JWT 토큰 반환' })
  @ApiResponse({ status: 400, description: '잘못된 로그인 정보' })
  @ApiBody({ type: StoreLoginDto })
  @Public()
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
  async createProduct(@Request() req, @Body() dto: CreateProductDto) {
    const storeId = req.user.sub; // JWT에서 상점 ID 추출
    return this.storeService.createProduct(storeId, dto);
  }

  // 내 상품 목록 조회 (상점 JWT 필요)
  @ApiOperation({ summary: '내 상품 목록 조회' })
  @ApiResponse({ status: 200, description: '상품 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Get('my-products')
  async getMyProducts(@Request() req) {
    const storeId = req.user.sub;
    return this.storeService.getMyProducts(storeId);
  }

  // 상점 상품 목록 조회 (고객용, 누구나 접근 가능)
  @ApiOperation({ summary: '상점 상품 목록 조회 (고객용)' })
  @ApiResponse({ status: 200, description: '상품 목록 조회 성공' })
  @ApiParam({ name: 'storeId', description: '상점 ID' })
  @Public()
  @Get(':storeId/products')
  async getStoreProducts(@Param('storeId') storeId: string) {
    const parsedStoreId = parseInt(storeId);
    if (isNaN(parsedStoreId)) {
      throw new BadRequestException('유효하지 않은 상점 ID입니다.');
    }
    return this.storeService.getStoreProducts(parsedStoreId);
  }

  // 주문 생성 (누구나 접근 가능 - QR 스캔용)
  @ApiOperation({ summary: '주문 생성 (QR 스캔 후)' })
  @ApiResponse({ status: 201, description: '주문 생성 성공' })
  @ApiResponse({ status: 400, description: '잔액 부족 또는 상품 없음' })
  @ApiParam({ name: 'storeId', description: '상점 ID' })
  @ApiBody({ type: CreateOrderDto })
  @Public()
  @Post(':storeId/orders')
  async createOrder(@Param('storeId') storeId: string, @Body() dto: CreateOrderDto) {
    const parsedStoreId = parseInt(storeId);
    if (isNaN(parsedStoreId)) {
      throw new BadRequestException('유효하지 않은 상점 ID입니다.');
    }
    return this.storeService.createOrder(parsedStoreId, dto);
  }

  // 내 주문 목록 조회 (상점 JWT 필요)
  @ApiOperation({ summary: '내 주문 목록 조회' })
  @ApiResponse({ status: 200, description: '주문 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  @Get('my-orders')
  async getMyOrders(@Request() req) {
    const storeId = req.user.sub;
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
  async completeOrder(@Request() req, @Param('orderId') orderId: string) {
    const storeId = req.user.sub;
    const parsedOrderId = parseInt(orderId);
    if (isNaN(parsedOrderId)) {
      throw new BadRequestException('유효하지 않은 주문 ID입니다.');
    }
    return this.storeService.completeOrder(storeId, parsedOrderId);
  }
} 