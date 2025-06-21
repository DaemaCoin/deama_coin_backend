import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    const { userId, orderItems } = dto;

    // 1. DTO에서 주문된 모든 상품의 ID 목록을 추출합니다.
    const productIds = orderItems.map((item) => item.productId);

    // 2. TypeORM의 `In` 연산자를 사용하여 모든 상품 정보를 한 번의 쿼리로 조회합니다.
    //    - `storeId`와 `isActive: true` 조건을 추가하여 해당 상점의 판매 중인 상품만 가져옵니다.
    //    - N+1 쿼리 문제를 방지하여 성능을 개선합니다.
    const products = await this.productRepository.find({
      where: { id: In(productIds), store: { id: storeId }, isActive: true },
    });

    // 3. 요청된 상품 ID 수와 실제 DB에서 조회된 상품 수가 일치하는지 확인합니다.
    //    - 수가 일치하지 않으면, 누락되거나 비활성화된 상품이 있다는 의미입니다.
    if (products.length !== productIds.length) {
      const foundProductIds = new Set(products.map((p) => p.id));
      const notFoundIds = productIds.filter((id) => !foundProductIds.has(id));
      throw new StoreException(
        `일부 상품을 찾을 수 없거나 비활성화 상태입니다: ${notFoundIds.join(', ')}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 4. 상품 ID를 키로, 상품 엔티티를 값으로 하는 Map을 생성하여 상품 정보에 빠르게 접근할 수 있도록 합니다.
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    // 5. 주문 항목(OrderItem) 엔티티 목록을 생성하고 동시에 총 주문 금액을 계산합니다.
    const newOrderItems = orderItems.map((item) => {
      const product = productMap.get(item.productId);

      totalAmount += product.price * item.quantity;

      // 5.1. `orderItemRepository.create`를 사용해 OrderItem 엔티티를 생성합니다.
      //      이 시점에서는 메모리에만 존재하며, DB에 저장되지는 않습니다.
      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        price: product.price, // 주문 당시의 가격을 기록합니다.
      });

      return orderItem;
    });

    // 6. 사용자의 지갑 정보를 조회하여 잔액을 확인합니다.
    const walletInfo = await this.walletService.getWallet(userId);

    if (walletInfo.balance < totalAmount) {
      throw new StoreException('잔액이 부족합니다.', HttpStatus.BAD_REQUEST);
    }

    // 7. 상점 정보를 조회하여 지갑 주소(storeName)를 확보합니다.
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new StoreException('상점을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 8. `walletService`를 통해 사용자의 지갑에서 상점 지갑으로 코인을 이체합니다.
    await this.walletService.transferAnonymous(userId, {
      to: store.storeName,
      amount: totalAmount,
    });

    // 9. 최종적으로 저장할 주문(Order) 엔티티를 생성합니다.
    //    - `orderItems` 속성에 위에서 생성한 `newOrderItems` 배열을 할당합니다.
    //    - OrderEntity의 `orderItems` 관계에 `cascade: true` 옵션이 설정되어 있어,
    //      이 Order 엔티티를 저장하면 연결된 OrderItem 엔티티들도 함께 DB에 저장됩니다.
    const order = this.orderRepository.create({
      user: { id: userId },
      store: { id: storeId },
      totalAmount,
      orderItems: newOrderItems,
    });

    // 10. 주문을 데이터베이스에 저장하고, 저장된 최종 엔티티를 반환합니다.
    //     `save` 메서드는 저장된 후의 엔티티(ID 및 관계 포함)를 반환하므로 추가적인 조회가 필요 없습니다.
    return await this.orderRepository.save(order);
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
