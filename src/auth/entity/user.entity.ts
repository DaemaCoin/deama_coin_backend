import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
