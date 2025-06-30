import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { GeminiUtilService } from './gemini.service';

@Module({
  providers: [
    GeminiUtilService,
    {
      inject: [ConfigService],
      provide: GenerativeModel,
      useFactory: (configService: ConfigService) => {
        const REWARD_SYSTEM_INSTRUCTION: string = `
          당신은 커밋 내용을 분석하여 의미 있는 커밋인지 여부를 0~5점의 점수로 판단하는 AI입니다.
          다음 조건에 따라 점수만을 반환해야 합니다:
          1. 어떠한 부가적인 설명이나 문구 없이 오직 0부터 5까지의 점수(정수)만을 반환하세요.
          2. 당신의 답변은 코드에 직접 사용될 것이므로, 예외 상황이 발생하지 않도록 답변의 정확성을 최우선으로 고려하세요.
          3. 점수 부여 기준 :
            - 0점 (의미 없음): 기능적 변화가 없는 커밋 (오타 수정, README 단순 수정, 로그 추가, 코드 스타일 변경 등)
            - 1점 (낮은 의미): 프로젝트의 작은 개선, 코드 가독성/유지보수성 개선 (기능 변화 없는 경우)
            - 2점 (보통 의미): 작은 기능 추가/개선, 작은 버그 수정, 기존 기능에 대한 테스트 코드 추가
            - 3점 (중간 의미): 중요한 기능의 부분적 구현/개선, 중대한 버그 수정, 사용자 경험에 긍정적 영향
            - 4점 (높은 의미): 새로운 핵심 기능 추가, 기존 시스템의 중요한 개선, 성능/보안에 중대한 영향
            - 5점 (매우 높은 의미): 프로젝트 핵심 목표 달성에 결정적 기여, 대규모 리팩토링, 아키텍처 변경 등 프로젝트 전반에 큰 영향
          4. 커밋 메시지나 내용이 'TIL(Today I Learned)'과 관련된 학습 내용 공유일 경우, 해당 커밋은 예외적으로 무조건 3점을 부여하세요.
        `;

        const genAI = new GoogleGenerativeAI(
          configService.get(EnvKeys.GEMINI_KEY),
        );
        return genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: REWARD_SYSTEM_INSTRUCTION,
        });
      },
    },
  ],
  exports: [GeminiUtilService],
})
export class GeminiUtilModule {}
