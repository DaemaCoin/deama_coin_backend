import { Injectable, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { StoreApplicationEntity, StoreApplicationStatus } from './entity/store-application.entity';
import { StoreEntity } from './entity/store.entity';
import { ProductEntity } from './entity/product.entity';
import { OrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { CreateStoreApplicationDto } from './dto/store-application.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';
import { WalletService } from '../wallet/wallet.service';
import { StoreException } from 'src/exception/custom-exception/store.exception';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreApplicationEntity)
    private storeApplicationRepository: Repository<StoreApplicationEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    private jwtService: JwtService,
    private walletService: WalletService,
  ) {}

  // 입점 신청
  async applyStore(dto: CreateStoreApplicationDto): Promise<StoreApplicationEntity> {
    const existingApplication = await this.storeApplicationRepository.findOne({
      where: { phoneNumber: dto.phoneNumber, status: StoreApplicationStatus.PENDING }
    });

    if (existingApplication) {
      throw new StoreException('이미 대기 중인 신청이 있습니다.', HttpStatus.BAD_REQUEST);
    }

    const application = this.storeApplicationRepository.create(dto);
    return this.storeApplicationRepository.save(application);
  }

  // 상점 로그인
  async login(dto: StoreLoginDto): Promise<{ accessToken: string }> {
    const encodedPassword = Buffer.from(dto.storeId).toString('base64');
    
    const store = await this.storeRepository.findOne({
      where: { storeId: dto.storeId, password: encodedPassword }
    });

    if (!store) {
      throw new StoreException('잘못된 로그인 정보입니다.', HttpStatus.BAD_REQUEST);
    }

    const payload = { storeId: store.storeId, sub: store.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  // 상품 추가
  async createProduct(storeId: number, dto: CreateProductDto): Promise<ProductEntity> {
    const product = this.productRepository.create({
      ...dto,
      storeId,
    });
    return this.productRepository.save(product);
  }

  // 상품 목록 조회 (상점용)
  async getMyProducts(storeId: number): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { storeId, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  // 상품 목록 조회 (고객용)
  async getStoreProducts(storeId: number): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { storeId, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  // 주문 생성
  async createOrder(id: string, dto: CreateOrderDto): Promise<OrderEntity> {
    // 1. 지갑 잔액 확인
    const walletInfo = await this.walletService.getWallet(dto.userId);
    
    // 2. 주문 상품들의 총 금액 계산
    let totalAmount = 0;
    const orderItemsData = [];

    const store = await this.storeRepository.findOne({
      where: { storeId: id }
    })

    const storeId: number = store.id;

    for (const item of dto.orderItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, storeId, isActive: true }
      });

      if (!product) {
        throw new StoreException(`상품을 찾을 수 없습니다: ${item.productId}`, HttpStatus.NOT_FOUND);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 3. 잔액 확인
    if (walletInfo.balance < totalAmount) {
      throw new StoreException('잔액이 부족합니다.', HttpStatus.BAD_REQUEST);
    }

    // 4. 코인 차감 (transfer 기능 활용)
    await this.walletService.transferAnonymous(dto.userId, {
      to: store.storeId, // 시스템 계정
      amount: totalAmount,
    });

    // 5. 주문 생성
    const order = this.orderRepository.create({
      userId: dto.userId,
      storeId,
      totalAmount,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 6. 주문 아이템들 생성
    for (const itemData of orderItemsData) {
      const orderItem = this.orderItemRepository.create({
        ...itemData,
        orderId: savedOrder.id,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // 7. 완전한 주문 정보 반환
    return this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['orderItems', 'orderItems.product']
    });
  }

  // 주문 목록 조회 (상점용)
  async getMyOrders(storeId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { storeId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' }
    });
  }

  // 주문 완료 처리
  async completeOrder(storeId: number, orderId: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, storeId }
    });

    if (!order) {
      throw new StoreException('주문을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    order.status = 'COMPLETED' as any;
    return this.orderRepository.save(order);
  }
} 