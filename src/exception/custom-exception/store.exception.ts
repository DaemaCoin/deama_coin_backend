import { HttpException } from '../http.exception';

export class StoreException extends HttpException {
  constructor(errMessage: string, status: number) {
    super(errMessage, status);
  }
}
