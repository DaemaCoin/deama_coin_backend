import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class ServerException extends HttpException {
  constructor() {
    super(
      '예상치 못한 문제가 서버에서 일어났습니다.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
