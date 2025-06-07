import { UserEntity } from 'src/auth/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('coin')
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
