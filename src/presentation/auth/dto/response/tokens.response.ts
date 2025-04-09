export class TokensResponse {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
