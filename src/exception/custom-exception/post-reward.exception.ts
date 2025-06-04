import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class PostRewardException extends HttpException {
  constructor() {
    super('리워드 생성중 문제가 발생하였습니다.', HttpStatus.UNAUTHORIZED);
  }
}
