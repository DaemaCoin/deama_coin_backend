import { WsException } from '@nestjs/websockets';

export class InvalidTokenFormatException extends WsException {
  constructor() {
    super('유효하지 않은 토큰 형식입니다.');
  }
}
