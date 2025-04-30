import { USER_ROLE } from 'src/common/enum/user-role';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PledgeOrmEntity } from './pledge.orm-entity';
import { DiaryOrmEntity } from './diary.orm-entity';

@Entity('user')
export class UserOrmEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column('varchar', {
    length: 80,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    length: 60,
    nullable: false,
  })
  password: string;

  @Column({
    length: 30,
    nullable: false,
  })
  nickname: string;

  @Column('enum', {
    enum: USER_ROLE,
    enumName: 'role',
    nullable: false,
    default: 0,
  })
  role: USER_ROLE;

  @Column({
    default: null,
  })
  withdrawDate: Date;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @OneToMany(() => PledgeOrmEntity, (pledges) => pledges.user)
  pledges: PledgeOrmEntity[];

  @OneToOne(() => DiaryOrmEntity)
  @JoinColumn()
  diary: DiaryOrmEntity;
}
