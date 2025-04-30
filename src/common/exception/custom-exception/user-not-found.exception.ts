import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('해당 이메일의 유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
