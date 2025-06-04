import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { StoreEntity } from './store.entity';
import { OrderItemEntity } from './order-item.entity';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  image: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  storeId: number;

  @ManyToOne(() => StoreEntity, store => store.products)
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;

  @OneToMany(() => OrderItemEntity, orderItem => orderItem.product)
  orderItems: OrderItemEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 