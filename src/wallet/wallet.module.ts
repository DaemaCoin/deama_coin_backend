import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [WalletController],
  providers: [
    WalletService,
    {
      inject: [ConfigService],
      provide: GenerativeModel,
      useFactory: (configService: ConfigService) => {
        const REWARD_SYSTEM_INSTRUCTION: string = `
          당신은 커밋 내용을 분석하여 의미 있는 커밋인지 여부를 판단하는 AI입니다.
          다음 조건에 따라 'true' 또는 'false'만을 반환해야 합니다:
          1. 어떠한 부가적인 설명이나 문구 없이 오직 'true' 또는 'false'로만 답하세요.
          2. 당신의 답변은 코드에 직접 사용될 것이므로, 예외 상황이 발생하지 않도록 답변의 정확성을 최우선으로 고려하세요.
          3. 커밋 내용이 '의미가 없다'고 판단되면 'false'를 반환하고, 그렇지 않으면 'true'를 반환하세요.
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
  exports: [WalletService],
})
export class WalletModule {}
