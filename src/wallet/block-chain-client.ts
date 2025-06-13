import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { BCException } from 'src/exception/custom-exception/bc.exception';

@Injectable()
export class BlockchainClient {
  private readonly bcServerUrl: string;
  private readonly xApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.bcServerUrl = this.configService.get(EnvKeys.DEAMA_COIN_BC_SERVER_URL);
    this.xApiKey = this.configService.get(EnvKeys.X_API_Key);
  }

  async fetch<T>(
    path: string,
    expectStatus: number,
    options: RequestInit,
  ): Promise<T> {
    const headers = {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      'X-API-Key': this.xApiKey,
    };

    try {
      const res = await fetch(`${this.bcServerUrl}${path}`, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => {
        throw new BCException(
          `블록체인 서버 응답이 올바르지 않습니다. (JSON 파싱 실패)`,
          res.status,
          path,
        );
      });

      if (res.status !== expectStatus) {
        throw new BCException(JSON.stringify(data), res.status, path);
      }

      return data;
    } catch (error) {
      if (error instanceof BCException) {
        throw error;
      }
      throw new BCException(
        `블록체인 서버 요청 중 오류가 발생했습니다: ${error.message}`,
        500,
        path,
      );
    }
  }
}
