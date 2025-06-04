import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/common/env.keys';
import { CreateWalletException } from 'src/exception/custom-exception/create-wallet.exception';
import { GetWalletException } from 'src/exception/custom-exception/get-wallet.exception';
import { TransferRequest } from './dto/request/transfer.request';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { Repository } from 'typeorm';
import { UserNotFoundException } from 'src/exception/custom-exception/user-not-found.exception';
import { TransferCoinException } from 'src/exception/custom-exception/transfer-coin.exception';

@Injectable()
export class WalletService {
  bcServerUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
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

    if (res.status == 202) {
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

    if (res.status == 200) {
      return data;
    } else {
      throw new GetWalletException(JSON.stringify(data), res.status);
    }
  }

  async transfer(owner: string, transferRequest: TransferRequest) {
    const { to, amount } = transferRequest;

    const toUser = await this.userRepository.findOne({ where: { id: to } });
    if (!toUser) throw new UserNotFoundException();

    const res = await fetch(`${this.bcServerUrl}/api/wallet/transfer`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.configService.get(EnvKeys.X_API_Key),
      },
      body: JSON.stringify({
        from: owner,
        to,
        amount,
      }),
    });

    const data = await res.json();

    if (res.status == 202) {
      return data;
    } else {
      throw new TransferCoinException(JSON.stringify(data));
    }
  }
}
