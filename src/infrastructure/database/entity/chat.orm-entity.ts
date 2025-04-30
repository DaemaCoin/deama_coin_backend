import { USER_ROLE } from 'src/common/enum/user-role';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PledgeOrmEntity } from './pledge.orm-entity';

@Entity('chat')
@Index(['promise'])
export class ChatOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: USER_ROLE,
    nullable: false,
  })
  role: USER_ROLE;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @ManyToOne(() => PledgeOrmEntity, (pledge) => pledge.chates, {
    nullable: false,
  })
  pledge: PledgeOrmEntity;
}
