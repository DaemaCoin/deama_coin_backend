export class GetPledgesCommand {
  constructor(
    public readonly userId: string,
    public readonly page?: number,
    public readonly dayOfWeek?: string[],
  ) {}
}
