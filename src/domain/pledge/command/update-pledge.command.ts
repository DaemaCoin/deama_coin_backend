import { PledgeState } from "src/common/enum/pledge-state";

export class UpdatePledgeCommand {
  constructor(
    public readonly userId: string,
    public readonly pledgeId: string,
    public readonly title?: string,
    public readonly dayOfWeek?: string[],
    public readonly pledgeState?: PledgeState,
  ) {}
}
