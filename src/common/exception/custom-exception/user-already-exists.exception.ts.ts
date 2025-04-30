import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('이미 사용중인 사용자입니다.', HttpStatus.CONFLICT);
  }
}
