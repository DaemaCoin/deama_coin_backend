import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class InsufficientBalanceException extends HttpException {
  constructor() {
    super('코인 잔액이 부족합니다.', HttpStatus.UNAUTHORIZED);
  }
}
