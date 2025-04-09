export class GitToken {
  constructor(
    public readonly accessToken: string,
    public readonly tokenType: string,
    public readonly scope: string,
  ) {}
}
