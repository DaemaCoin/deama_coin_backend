import { HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class PromiseNotFoundException extends WsException {
  constructor() {
    super('해당하는 ID의 약속이 아닙니다.');
  }
}
