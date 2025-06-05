import { HttpStatus } from '@nestjs/common';
import { HttpException } from '../http.exception';

export class GetRewardScoreException extends HttpException {
  constructor() {
    super(`AI COMMIT 분석에 실패하였습니다.`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
