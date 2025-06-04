import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { StoreEntity } from './store.entity';
import { OrderItemEntity } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string; // 구매자 지갑 아이디

  @Column()
  storeId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => StoreEntity, store => store.orders)
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;

  @OneToMany(() => OrderItemEntity, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItemEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 