import { InjectRepository } from '@nestjs/typeorm';
import { PledgeOrmEntity } from '../entity/pledge.orm-entity';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { Pledge } from 'src/domain/pledge/model/pledge.model';
import { uuid } from 'src/common/util/generate-uuid';
import { generateNow } from 'src/common/util/generate-ko-time';
import { PledgeCommandRepository } from 'src/domain/pledge/repository/pledge.command-repository';
import { UpdatePledgeCommand } from 'src/domain/pledge/command/update-pledge.command';

export class PledgeCommandRepositoryImpl implements PledgeCommandRepository {
  constructor(
    @InjectRepository(PledgeOrmEntity)
    private readonly pledgeRepository: Repository<PledgeOrmEntity>,
  ) {}
  async save(
    command: Partial<Pledge>,
    entityManager?: EntityManager,
  ): Promise<Pledge> {
    if (entityManager) {
      return this.toPledge(
        await entityManager.save(PledgeOrmEntity, {
          ...command,
          id: uuid(),
          createdAt: generateNow(),
          user: { id: command.userId },
        }),
      );
    } else {
      return this.toPledge(
        await this.pledgeRepository.save({
          ...command,
          id: uuid(),
          createdAt: generateNow(),
          user: { id: command.userId },
        }),
      );
    }
  }

  async update(
    command: UpdatePledgeCommand,
    entityManager?: EntityManager,
  ): Promise<void> {
    const { userId, pledgeId, title, dayOfWeek, pledgeState } = command;

    if (!title && !dayOfWeek && !pledgeId) return;
    if (entityManager) {
      await entityManager.update(
        Pledge,
        { id: pledgeId, user: { id: userId } },
        {
          title,
          dayOfWeek: dayOfWeek ? dayOfWeek.join(',') : undefined,
          pledgeState,
        },
      );
    } else {
      await this.pledgeRepository.update(
        { id: pledgeId, user: { id: userId } },
        {
          title,
          dayOfWeek: dayOfWeek ? dayOfWeek.join(',') : undefined,
          pledgeState,
        },
      );
    }
  }

  async delete(
    command: Required<Pick<Pledge, 'id' | 'userId'>>,
    entityManager?: EntityManager,
  ): Promise<void> {
    const { id, userId } = command;

    if (entityManager) {
      await entityManager.delete(Pledge, { id, user: { id: userId } });
    } else {
      await this.pledgeRepository.delete({ id, user: { id: userId } });
    }
  }

  private toPledge(pledgeEntity: PledgeOrmEntity): Pledge {
    return new Pledge(
      pledgeEntity.id,
      pledgeEntity.title,
      pledgeEntity.dayOfWeek,
      pledgeEntity.pledgeState,
      pledgeEntity.createdAt,
      pledgeEntity.user.id,
    );
  }
}
