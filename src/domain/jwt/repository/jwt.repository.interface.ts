import { Token } from "../model/tokens.model";

export const JWT_REPOSITORY_TOKEN = 'JWT_REPOSITORY_TOKEN';

export interface JwtRepository {
  signToken(data: {
    userId: string;
    secret: string;
    expiresIn: string;
  }): Promise<Token>;
}
