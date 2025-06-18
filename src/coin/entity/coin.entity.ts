import { UserEntity } from 'src/auth/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Index,
} from 'typeorm';

@Entity('coin')
@Index(['user', 'createdAt'])
@Index(['createdAt'])
export class CoinEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  amount: number;

  @Column()
  message: string;

  @Column()
  repoName: string;

  @ManyToOne(() => UserEntity, (user) => user.coins)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
