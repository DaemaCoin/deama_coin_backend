import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class IsNotUUidException extends HttpException {
  constructor() {
    super('아이디 형식이 UUID가 아닙니다.', HttpStatus.BAD_REQUEST);
  }
}
