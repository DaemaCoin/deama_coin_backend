import { CoinEntity } from 'src/wallet/entity/commit.entity';
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
  totalCoins: number

  @OneToMany(() => CoinEntity, (coin) => coin.user)
  coins: CoinEntity[]
}
