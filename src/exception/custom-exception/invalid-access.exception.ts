import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class InvalidAccessException extends HttpException {
  constructor() {
    super('유효하지 않은 접근입니다.', HttpStatus.FORBIDDEN);
  }
}
