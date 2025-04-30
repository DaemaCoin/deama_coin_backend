import { WsException } from '@nestjs/websockets';

export class ChatGPTException extends WsException {
  constructor() {
    super('글 생성 중 에러가 발생하였습니다. 다시 시도해 주세요.');
  }
}
