import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StoreApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('store_application')
export class StoreApplicationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeName: string;

  @Column('text')
  storeDescription: string;

  @Column()
  storeImage: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: StoreApplicationStatus,
    default: StoreApplicationStatus.PENDING,
  })
  status: StoreApplicationStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 