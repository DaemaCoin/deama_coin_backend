import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';
import { EntityDateTransformer } from 'src/common/util/entity-date-transformer';

@Entity('store')
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @Column({ unique: true })
  storeName: string;

  @Column('text')
  storeDescription: string;

  @Column()
  storeImage: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductEntity, (product) => product.store)
  products: ProductEntity[];

  @OneToMany(() => OrderEntity, (order) => order.store)
  orders: OrderEntity[];

  @CreateDateColumn({ type: 'timestamp', transformer: EntityDateTransformer })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
