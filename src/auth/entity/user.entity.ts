import { CoinEntity } from 'src/coin/entity/coin.entity';
import { Column, Entity, OneToMany, PrimaryColumn, Index } from 'typeorm';

@Entity('user')
@Index(['totalCommits'])
@Index(['dailyCoinAmount'])
@Index(['lastCoinDate'])
export class UserEntity {
  @PrimaryColumn({
    unique: true,
  })
  id: string;

  @Column({
    unique: true,
  })
  githubId: string;

  @Column()
  githubImageUrl: string;

  @Column({ default: 0 })
  totalCommits: number;

  @Column({ default: 0 })
  dailyCoinAmount: number;

  @Column({ type: 'date', nullable: true })
  lastCoinDate: Date;

  @OneToMany(() => CoinEntity, (coin) => coin.user)
  coins: CoinEntity[];
}
