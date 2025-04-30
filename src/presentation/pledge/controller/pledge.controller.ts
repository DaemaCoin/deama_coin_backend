import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PledgeService } from 'src/application/pledge/pledge.service';
import { GetUserId } from 'src/common/decorator/get-user-id';
import { CreatePledgeRequest } from '../dto/request/create-pledge.request';
import { GetPledgesRequest } from '../dto/request/get-pledge.request';
import { GetPledgesBodyRequest } from '../dto/request/get-pledge-body.request';
import { UpdatePledgeRequest } from '../dto/request/update-pledge.request';
import { UUIDCheckPipe } from 'src/common/pipe/uuid-check.pipe';
import { ChangePledgeStateRequest } from '../dto/request/change-pledge-state.request';

@Controller('pledge')
export class PledgeController {
  constructor(private readonly pledgeService: PledgeService) {}

  @Get()
  async getPledges(
    @GetUserId() userId: string,
    @Query() getPledgesRequest: GetPledgesRequest,
    @Body() getPledgesBodyRequest: GetPledgesBodyRequest,
  ) {
    return await this.pledgeService.getPledges(
      userId,
      getPledgesRequest,
      getPledgesBodyRequest,
    );
  }

  @Post()
  async save(
    @GetUserId() userId: string,
    @Body() createPledgeRequest: CreatePledgeRequest,
  ) {
    return await this.pledgeService.create(userId, createPledgeRequest);
  }

  @Patch('/:id')
  update(
    @GetUserId() userId: string,
    @Param('id', UUIDCheckPipe) id: string,
    @Body() updatePledgeRequest: UpdatePledgeRequest,
  ) {
    return this.pledgeService.updatePledge(userId, id, updatePledgeRequest);
  }

  @Delete('/:id')
  delete(@GetUserId() userId: string, @Param('id', UUIDCheckPipe) id: string) {
    return this.pledgeService.deletePledge(userId, id);
  }

  @Patch('/state/:id')
  changeState(
    @Param('id', UUIDCheckPipe) id: string,
    @GetUserId() userId: string,
    @Body() changePledgeStateRequest: ChangePledgeStateRequest,
  ) {
    return this.pledgeService.changePledgeState(
      userId,
      id,
      changePledgeStateRequest,
    );
  }
}
