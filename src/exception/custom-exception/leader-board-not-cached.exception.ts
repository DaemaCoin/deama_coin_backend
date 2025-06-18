import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class LeaderBoardNotCachedException extends HttpException {
  constructor() {
    super('리더보드가 갱신되지 않았습니다. 잠시 기다려주세요 ( 최대 3분 )', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
