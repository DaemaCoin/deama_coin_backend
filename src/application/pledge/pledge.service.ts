import { Injectable } from '@nestjs/common';
import { PledgeState } from 'src/common/enum/pledge-state';
import { PledgeNotFoundException } from 'src/common/exception/custom-exception/pledge-not-found.exception';
import { GetPledgesCommand } from 'src/domain/pledge/command/get-pledges.command';
import { UpdatePledgeCommand } from 'src/domain/pledge/command/update-pledge.command';
import { DeletePledgeUseCase } from 'src/domain/pledge/usecase/delete-pledge.usecase';
import { FindOnePledgeUseCase } from 'src/domain/pledge/usecase/find-one-pledge.usecase';
import { GetPledgesUseCase } from 'src/domain/pledge/usecase/get-pledges.usecase';
import { SavePledgeUseCase } from 'src/domain/pledge/usecase/save-pledge.usecase';
import { UpdatePledgeUseCase } from 'src/domain/pledge/usecase/update-pledge.usecase';
import { ChangePledgeStateRequest } from 'src/presentation/pledge/dto/request/change-pledge-state.request';
import { CreatePledgeRequest } from 'src/presentation/pledge/dto/request/create-pledge.request';
import { GetPledgesBodyRequest } from 'src/presentation/pledge/dto/request/get-pledge-body.request';
import { GetPledgesRequest } from 'src/presentation/pledge/dto/request/get-pledge.request';
import { UpdatePledgeRequest } from 'src/presentation/pledge/dto/request/update-pledge.request';
import { GetPledgesResponse } from 'src/presentation/pledge/dto/response/get-pledges.response';

@Injectable()
export class PledgeService {
  constructor(
    private readonly getPledgesUseCase: GetPledgesUseCase,
    private readonly savePledgeUseCase: SavePledgeUseCase,
    private readonly updatePledgeUseCase: UpdatePledgeUseCase,
    private readonly findOnePledgeUseCase: FindOnePledgeUseCase,
    private readonly deletePledgeUseCase: DeletePledgeUseCase,
  ) {}

  async create(userId: string, createPledgeRequest: CreatePledgeRequest) {
    const { title, dayOfWeek } = createPledgeRequest;

    return await this.savePledgeUseCase.execute({
      title,
      dayOfWeek: dayOfWeek.join(','),
      userId,
    });
  }

  async getPledges(
    userId: string,
    getPledgesRequest: GetPledgesRequest,
    getPledgesBodyRequest: GetPledgesBodyRequest,
  ) {
    const getPledgesCommand = new GetPledgesCommand(
      userId,
      getPledgesRequest.page,
      getPledgesBodyRequest.dayOfWeek,
    );
    return new GetPledgesResponse(
      await this.getPledgesUseCase.execute(getPledgesCommand),
    );
  }

  async updatePledge(
    userId: string,
    pledgeId: string,
    updatePledgeRequest: UpdatePledgeRequest,
  ) {
    const pledge = await this.findOnePledgeUseCase.execute({
      id: pledgeId,
      userId,
    });
    if (!pledge) throw new PledgeNotFoundException();

    const updatePledgeCommand = new UpdatePledgeCommand(
      userId,
      pledgeId,
      updatePledgeRequest.title,
      updatePledgeRequest.dayOfWeek,
    );
    await this.updatePledgeUseCase.execute(updatePledgeCommand);
  }

  async deletePledge(userId: string, pledgeId: string) {
    const pledge = await this.findOnePledgeUseCase.execute({
      id: pledgeId,
      userId,
    });
    if (!pledge) throw new PledgeNotFoundException();

    await this.deletePledgeUseCase.execute({ id: pledgeId, userId });
  }

  async changePledgeState(
    userId: string,
    pledgeId: string,
    changePledgeStateRequest: ChangePledgeStateRequest
  ) {
    const pledge = await this.findOnePledgeUseCase.execute({
      id: pledgeId,
      userId,
    });
    if (!pledge) throw new PledgeNotFoundException();

    const updatePledgeCommand = new UpdatePledgeCommand(
      userId,
      pledgeId,
      undefined,
      undefined,
      PledgeState[changePledgeStateRequest.pledgeState],
    );
    await this.updatePledgeUseCase.execute(updatePledgeCommand);
  }
}
