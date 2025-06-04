import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('존재하지 않는 유저입니다.', HttpStatus.UNAUTHORIZED);
  }
}
