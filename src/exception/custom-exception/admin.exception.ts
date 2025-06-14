import { HttpException } from '../http.exception';

export class AdminException extends HttpException {
  constructor(errMessage: string, status: number) {
    super(errMessage, status);
  }
}
