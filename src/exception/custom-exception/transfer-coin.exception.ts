import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class TransferCoinException extends HttpException {
  constructor(errMessage: string) {
    super(`코인 전송중 오류가 발생하였습니다. ${errMessage}`, HttpStatus.BAD_REQUEST);
  }
}
