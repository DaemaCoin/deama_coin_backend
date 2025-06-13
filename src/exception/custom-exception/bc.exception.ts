import { HttpException } from '../http.exception';

export class BCException extends HttpException {
  constructor(errMessage: string, status: number, path: string) {
    super(errMessage, status, path);
  }
}
