import { GenerativeModel } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { GetCommitScoreException } from 'src/exception/custom-exception/get-reward-score.exception';

@Injectable()
export class GeminiService {
  constructor(private readonly geminiModel: GenerativeModel) {}

  async getCommitScore(commitContent: string): Promise<number> {
    try {
      const result = await this.geminiModel.generateContent(
        `커밋 내용 : ${commitContent}`,
      );
      const response = result.response;
      return Number(response.text().trim());
    } catch (error) {
      console.error('Gemini reward 기능 호출 중 오류 발생:', error);
      throw new GetCommitScoreException();
    }
  }
}
