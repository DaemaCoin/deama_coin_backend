import { PledgeQueryRepository } from 'src/domain/pledge/repository/pledge.query-repository';
import { PledgeOrmEntity } from '../entity/pledge.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Pledge } from 'src/domain/pledge/model/pledge.model';
import { Injectable } from '@nestjs/common';
import { GetPledgesCommand } from 'src/domain/pledge/command/get-pledges.command';

@Injectable()
export class PledgeQueryRepositoryImpl implements PledgeQueryRepository {
  constructor(
    @InjectRepository(PledgeOrmEntity)
    private readonly pledgeRepository: Repository<PledgeOrmEntity>,
  ) {}

  async findOne(
    where: Pick<Partial<Pledge>, 'id' | 'userId'>,
    entityManager?: EntityManager,
  ): Promise<Pledge | null> {
    let pledge: PledgeOrmEntity | null;

    if (entityManager) {
      pledge = await entityManager.findOne(PledgeOrmEntity, {
        where: { id: where.id, user: { id: where.userId } },
      });
    } else {
      pledge = await this.pledgeRepository.findOne({
        where: { id: where.id, user: { id: where.userId } },
      });
    }

    if (!pledge) return null;
    return this.toPledge(pledge);
  }

  async getPledges(
    command: GetPledgesCommand,
    entityManager?: EntityManager,
  ): Promise<Pledge[]> {
    let pledges: PledgeOrmEntity[];
    const takeNumber = 10;
    const { userId, page = 0, dayOfWeek } = command;

    const query = entityManager
      ? entityManager.createQueryBuilder(PledgeOrmEntity, 'p')
      : this.pledgeRepository.createQueryBuilder('p');

    query
      .skip(page * takeNumber)
      .take(takeNumber)
      .where('p.userId = :userId', { userId });

    if (dayOfWeek) {
      dayOfWeek.forEach((day) => {
        query.andWhere(`find_in_set(:day, p.dayOfWeek)`, {
          day,
        });
      });
    }

    query.orderBy('p.createdAt', 'DESC');

    pledges = await query.getMany();

    return pledges.map((v) => this.toPledge(v));
  }

  private toPledge(pledgeEntity: PledgeOrmEntity): Pledge {
    return new Pledge(
      pledgeEntity.id,
      pledgeEntity.title,
      pledgeEntity.dayOfWeek,
      pledgeEntity.pledgeState,
      pledgeEntity.createdAt,
    );
  }
}
