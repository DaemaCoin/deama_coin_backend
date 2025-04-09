import { Inject, Injectable } from '@nestjs/common';
import {
  XQUARE_REPOSITORY_TOKEN,
  XquareRepository,
} from '../repository/xquare.repository.interface';
import { XquareUser } from '../model/xquare-user.model';
import { LoginCommand } from './command/login.command';

@Injectable()
export class GetXquareUserUsecCase {
  constructor(
    @Inject(XQUARE_REPOSITORY_TOKEN)
    private readonly xquareRepository: XquareRepository,
  ) {}

  async execute(command: LoginCommand): Promise<XquareUser> {
    const { accountId, password } = command;
    return await this.xquareRepository.getXquareUser(accountId, password);
  }
}
