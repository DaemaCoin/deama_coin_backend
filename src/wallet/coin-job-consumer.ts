import { GenerativeModel } from '@google/generative-ai';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  COIN_JOB_QUEUE,
  COIN_PROCESS_COMMIT_FOR_REWARD_JOBJOB_NAME,
} from 'src/common/global';

@Processor(COIN_JOB_QUEUE)
export class CoinJobConsumer {
  constructor(private geminiModel: GenerativeModel) {}

  @Process(COIN_PROCESS_COMMIT_FOR_REWARD_JOBJOB_NAME)
  handleTranscode(job: Job) {
    console.log(job.data);
  }

  async reward(commitContent: string): Promise<boolean> {
    try {
      const result = await this.geminiModel.generateContent(
        `커밋 내용 : ${commitContent}`,
      );
      const response = result.response;
      return response.text().includes('true');
    } catch (error) {
      console.error('Gemini reward 기능 호출 중 오류 발생:', error);
      throw new Error('AI 커밋 분석에 실패했습니다.');
    }
  }
}
