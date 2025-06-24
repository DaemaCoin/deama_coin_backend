import { toZonedTime } from 'date-fns-tz';
import { UserEntity } from 'src/auth/entity/user.entity';
import { getCurrentKoreanTime } from 'src/common/util/date-fn';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Index,
  BeforeInsert,
} from 'typeorm';

export enum CoinType {
  INIT = 'INIT',
  MINING = 'MINING',
  TRANSFER = 'TRANSFER',
}

@Entity('coin')
@Index(['user', 'createdAt'])
@Index(['createdAt'])
export class CoinEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  repoName: string;

  @Column({ type: 'enum', enum: CoinType, nullable: false })
  type: CoinType;

  @ManyToOne(() => UserEntity, (user) => user.coins)
  user: UserEntity;

  @Column({ nullable: false })
  createdAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = getCurrentKoreanTime();
  }
}
