import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class LoginFailException extends HttpException {
  constructor() {
    super('로그인에 실패하였습니다.', HttpStatus.FORBIDDEN);
  }
}
