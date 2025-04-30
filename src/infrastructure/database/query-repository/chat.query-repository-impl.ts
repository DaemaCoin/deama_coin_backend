import OpenAI from 'openai';
import { WellPromiseCommand } from 'src/domain/chat/command/welll-promise.command';
import { ChatQueryRepository } from 'src/domain/chat/repository/chat.query-repository';

export class ChatQueryRepositoryImpl implements ChatQueryRepository {
  constructor(private readonly openai: OpenAI) {}

  async wellProimse(command: WellPromiseCommand, entityManager?: unknown) {
    return await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `너는 내가 나와의 약속을 지키도록 돕는 AI야.\n
            "${command.message}" 약속을 지키는 방법을 알려줘\n
            답변 형식 : "1.소제목 : 내용"\n
            대답에 스타일을 적용하지 말아줘\n
          `,
        },
      ],
    });
  }
}
