import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { CreateWalletException } from 'src/exception/custom-exception/create-wallet.exception';
import { GetWalletException } from 'src/exception/custom-exception/get-wallet.exception';

@Injectable()
export class WalletService {
  bcServerUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bcServerUrl = this.configService.get(EnvKeys.DEAMA_COIN_BC_SERVER_URL);
  }

  async createWallet(owner: string) {    
    const res = await fetch(`${this.bcServerUrl}/api/wallet`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.configService.get(EnvKeys.X_API_Key),
      },
      body: JSON.stringify({
        owner: owner,
        initialBalance: 0,
      }),
    });

    const data = await res.json();

    if(res.status == 202) {
      return data;
    } else {
      throw new CreateWalletException(JSON.stringify(data));
    }
  }

  async getWallet(owner: string) {
    const res = await fetch(`${this.bcServerUrl}/api/wallet/${owner}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.configService.get(EnvKeys.X_API_Key),
      },
    });

    const data = await res.json();

    if(res.status == 200) {
      return data;
    } else {
      throw new GetWalletException(JSON.stringify(data), res.status);
    }
  }
}
