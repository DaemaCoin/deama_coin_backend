import { getCurrentKoreanTime } from 'src/common/util/date-fn';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

export enum StoreApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('store_application')
export class StoreApplicationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  storeName: string;

  @Column('text')
  storeDescription: string;

  @Column()
  storeImage: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: StoreApplicationStatus,
    default: StoreApplicationStatus.PENDING,
  })
  status: StoreApplicationStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = getCurrentKoreanTime();
  }
}
