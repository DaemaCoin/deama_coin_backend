import { GenerativeModel } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { GetCommitScoreException } from 'src/exception/custom-exception/get-reward-score.exception';

@Injectable()
export class GeminiUtilService {
  constructor(private readonly geminiModel: GenerativeModel) {}

  async getCommitScore(commitContent: string): Promise<number> {
    try {
      const result = await this.geminiModel.generateContent(
        `커밋 내용 : ${commitContent}`,
      );
      const response = result.response;
      const score = Number(response.text().trim());
      if (isNaN(score)) {
        console.error('getCommitScore: 반환값이 숫자가 아님:', response.text());
        throw new GetCommitScoreException();
      }
      return score;
    } catch (error) {
      console.error('Gemini reward 기능 호출 중 오류 발생:', error);
      throw new GetCommitScoreException();
    }
  }
}
