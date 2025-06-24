import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';
import { getCurrentKoreanTime } from 'src/common/util/date-fn';

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

  @Column({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = getCurrentKoreanTime();
  }
}
