import { PledgeState } from 'src/common/enum/pledge-state';

export const PledgeBrand: unique symbol = Symbol('Pledge');

export class Pledge {
  readonly [PledgeBrand]: void;

  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly dayOfWeek: string,
    public readonly pledgeState: PledgeState,
    public readonly createdAt: Date,
    public readonly userId?: string,
  ) {}
}
