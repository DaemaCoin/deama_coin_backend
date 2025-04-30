import { USER_ROLE } from 'src/common/enum/user-role';

export class Chat {
  constructor(
    public readonly id: number,
    public readonly pledgeId: string,
    public readonly role: USER_ROLE,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}
}
