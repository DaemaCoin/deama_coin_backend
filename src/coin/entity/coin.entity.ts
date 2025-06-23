import { UserEntity } from 'src/auth/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Index,
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

  @CreateDateColumn({ nullable: false })
  createdAt: Date;
}
