import { HttpException } from '../http.exception';

export class GetWalletException extends HttpException {
  constructor(errMessage: any, status: number) {
    super(errMessage, status);
  }
}
