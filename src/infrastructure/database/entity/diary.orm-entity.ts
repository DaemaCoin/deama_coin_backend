import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('diary')
export class DiaryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  detail: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;
}
