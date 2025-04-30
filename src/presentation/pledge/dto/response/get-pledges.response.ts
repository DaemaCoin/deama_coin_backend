import { Pledge } from 'src/domain/pledge/model/pledge.model';

export class GetPledgesResponse {
  pledges: Pledge[];

  constructor(pledges: Pledge[]) {
    this.pledges = pledges;
  }
}
