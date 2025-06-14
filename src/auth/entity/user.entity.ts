import { CoinEntity } from 'src/coin/entity/coin.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('user')
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

  @Column()
  totalCommits: number;

  @OneToMany(() => CoinEntity, (coin) => coin.user)
  coins: CoinEntity[];
}
