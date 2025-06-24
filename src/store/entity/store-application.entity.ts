import { EntityDateTransformer } from 'src/common/util/entity-date-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ type: 'timestamp', transformer: EntityDateTransformer })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
