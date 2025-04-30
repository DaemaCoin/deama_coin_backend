export class TokensResponse {
  accessToken: string;
  refreshToken: string;

  constructor(accessToken: string, refreeshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreeshToken;
  }
}
