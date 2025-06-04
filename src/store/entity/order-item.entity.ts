import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from './product.entity';

@Entity('order_item')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // 주문 당시의 상품 가격

  @ManyToOne(() => OrderEntity, order => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, product => product.orderItems)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;
} 