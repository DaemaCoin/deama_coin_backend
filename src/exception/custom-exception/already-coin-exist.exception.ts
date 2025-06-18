import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class AlreadyCoinExistException extends HttpException {
  constructor() {
    super('이미 존재하는 코인을 등록하였습니다.', HttpStatus.BAD_REQUEST);
  }
}
