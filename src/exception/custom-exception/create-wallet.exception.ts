import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class CreateWalletException extends HttpException {
  constructor(errMessage: string) {
    super(`지갑 생성 중 오류가 발생하였습니다. ${errMessage}`, HttpStatus.BAD_REQUEST);
  }
}
