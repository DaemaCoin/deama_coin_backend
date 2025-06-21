import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  StoreApplicationEntity,
  StoreApplicationStatus,
} from './entity/store-application.entity';
import { StoreEntity } from './entity/store.entity';
import { ProductEntity } from './entity/product.entity';
import { OrderEntity, OrderStatus } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { CreateStoreApplicationDto } from './dto/store-application.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { CreateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';
import { WalletService } from '../wallet/wallet.service';
import { StoreException } from 'src/exception/custom-exception/store.exception';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreApplicationEntity)
    private readonly storeApplicationRepository: Repository<StoreApplicationEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly jwtService: JwtService,
    private readonly walletService: WalletService,
  ) {}

  async applyStore(dto: CreateStoreApplicationDto): Promise<StoreApplicationEntity> {
    let existing = await this.storeApplicationRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existing) {
      const isRejected = existing.status === StoreApplicationStatus.REJECTED;
      const isPending = existing.status === StoreApplicationStatus.PENDING;

      if (isRejected) {
        existing = {
          ...existing,
          ...dto,
          status: StoreApplicationStatus.PENDING,
          rejectionReason: null,
        };
        return this.storeApplicationRepository.save(existing);
      }

      if (isPending) {
        throw new StoreException('이미 대기 중인 신청이 있습니다.', HttpStatus.BAD_REQUEST);
      }

      throw new StoreException('한 개의 전화번호는 한 개의 상점만 열 수 있습니다.', HttpStatus.BAD_REQUEST);
    }

    const application = this.storeApplicationRepository.create(dto);
    return this.storeApplicationRepository.save(application);
  }

  async login(dto: StoreLoginDto): Promise<{ accessToken: string }> {
    const store = await this.storeRepository.findOne({
      where: { storeName: dto.storeId, password: dto.password },
    });

    if (!store) {
      throw new StoreException('잘못된 로그인 정보입니다.', HttpStatus.BAD_REQUEST);
    }

    const payload = { storeId: store.storeName, sub: store.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async createProduct(storeId: number, dto: CreateProductDto): Promise<ProductEntity> {
    const product = this.productRepository.create({
      ...dto,
      store: { id: storeId },
    });
    return await this.productRepository.save(product);
  }

  async getMyProducts(storeId: number): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      where: { store: { id: storeId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getStoreProducts(storeId: number): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      where: { store: { id: storeId }, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createOrder(storeId: number, dto: CreateOrderDto): Promise<OrderEntity> {
    const walletInfo = await this.walletService.getWallet(dto.userId);

    let totalAmount = 0;
    const orderItemsData = [];

    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    for (const item of dto.orderItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, store: { id: storeId }, isActive: true },
      });

      if (!product) {
        throw new StoreException(`상품을 찾을 수 없습니다: ${item.productId}`, HttpStatus.NOT_FOUND);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        product: { id: product.id },
        quantity: item.quantity,
        price: product.price,
      });
    }

    if (walletInfo.balance < totalAmount) {
      throw new StoreException('잔액이 부족합니다.', HttpStatus.BAD_REQUEST);
    }

    await this.walletService.transferAnonymous(dto.userId, {
      to: store.storeName,
      amount: totalAmount,
    });

    const order = this.orderRepository.create({
      user: { id: dto.userId },
      store: { id: storeId },
      totalAmount,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const itemData of orderItemsData) {
      const orderItem = this.orderItemRepository.create({
        ...itemData,
        order: { id: savedOrder.id },
      });
      await this.orderItemRepository.save(orderItem);
    }

    return await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['orderItems', 'orderItems.product'],
    });
  }

  // 주문 목록 조회 (상점용)
  async getMyOrders(storeId: number): Promise<OrderEntity[]> {
    return await this.orderRepository.find({
      where: { store: { id: storeId } },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  // 주문 완료 처리
  async completeOrder(storeId: number, orderId: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, store: { id: storeId } },
    });

    if (!order) {
      throw new StoreException('주문을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    order.status = OrderStatus.COMPLETED;
    return await this.orderRepository.save(order);
  }
}
