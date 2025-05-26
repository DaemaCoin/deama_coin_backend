import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class RegisterException extends HttpException {
  constructor() {
    super('이미 존재하는 유저입니다.', HttpStatus.UNAUTHORIZED);
  }
}
