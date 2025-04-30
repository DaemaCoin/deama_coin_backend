import { WsException } from '@nestjs/websockets';

export class SaveChatErrorException extends WsException {
  constructor() {
    super('채팅 내역 저장 중 에러가 발생하였습니다.');
  }
}
