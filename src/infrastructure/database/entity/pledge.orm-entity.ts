import { PledgeState } from 'src/common/enum/pledge-state';
import { dayOfWeeks } from 'src/common/set/day-of-weeks';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { ChatOrmEntity } from './chat.orm-entity';

@Entity('pledge')
export class PledgeOrmEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'set', enum: dayOfWeeks, nullable: true })
  dayOfWeek: string;

  @Column({
    type: 'enum',
    enum: PledgeState,
    default: PledgeState.NotCompleted,
  })
  pledgeState: PledgeState;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @ManyToOne(() => UserOrmEntity, (user) => user.pledges)
  user: UserOrmEntity;

  @OneToMany(() => ChatOrmEntity, (chat) => chat.pledge)
  chates: ChatOrmEntity[];
}
