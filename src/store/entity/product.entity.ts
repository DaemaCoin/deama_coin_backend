import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { StoreEntity } from './store.entity';
import { OrderItemEntity } from './order-item.entity';
import { getCurrentKoreanTime } from 'src/common/util/date-fn';

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

  @ManyToOne(() => StoreEntity, (store) => store.products, { nullable: false })
  store: StoreEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.product)
  orderItems: OrderItemEntity[];

  @Column({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = getCurrentKoreanTime();
  }
}
