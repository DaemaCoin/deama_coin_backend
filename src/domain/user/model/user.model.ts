import { USER_ROLE } from 'src/common/enum/user-role';
import { Diary } from 'src/domain/diary/model/diary.model';

export const UserBrand: unique symbol = Symbol('User');

export class User {
  readonly [UserBrand]: void;

  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly nickname: string,
    public readonly role: USER_ROLE,
    public readonly withdrawDate: Date,
    public readonly createdAt: Date,
    public readonly diary?: Diary,
  ) {}
}
