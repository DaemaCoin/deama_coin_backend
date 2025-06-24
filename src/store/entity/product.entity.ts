import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { StoreEntity } from './store.entity';
import { OrderItemEntity } from './order-item.entity';
import { EntityDateTransformer } from 'src/common/util/entity-date-transformer';

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

  @CreateDateColumn({ type: 'timestamp', transformer: EntityDateTransformer })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
