import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity('store')
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  storeId: string; // 상점 이름을 그대로 사용

  @Column()
  password: string; // base64 인코딩된 상점 이름

  @Column()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 