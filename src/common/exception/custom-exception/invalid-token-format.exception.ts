import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class InvalidTokenFormatException extends HttpException {
  constructor() {
    super('유효하지 않은 토큰 형식입니다.', HttpStatus.UNAUTHORIZED);
  }
}
