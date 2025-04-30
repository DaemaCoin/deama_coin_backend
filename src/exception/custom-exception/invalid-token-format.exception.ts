import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class InvalidTokenFormatException extends HttpException {
  constructor() {
    super('유효하지 않은 토큰입니다.', HttpStatus.FORBIDDEN);
  }
}
