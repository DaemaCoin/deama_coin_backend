import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  StoreApplicationEntity,
  StoreApplicationStatus,
} from '../store/entity/store-application.entity';
import { StoreEntity } from '../store/entity/store.entity';
import { UpdateStoreApplicationStatusDto } from '../store/dto/store-application.dto';
import { WalletService } from 'src/wallet/wallet.service';
import { AdminException } from 'src/exception/custom-exception/admin.exception';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(StoreApplicationEntity)
    private storeApplicationRepository: Repository<StoreApplicationEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  async getStoreApplications(): Promise<StoreApplicationEntity[]> {
    return await this.storeApplicationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateStoreApplicationStatus(
    applicationId: number,
    dto: UpdateStoreApplicationStatusDto,
  ): Promise<StoreApplicationEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const application = await queryRunner.manager.findOne(StoreApplicationEntity, {
        where: { id: applicationId, status: StoreApplicationStatus.PENDING },
      });
      if (!application) {
        throw new AdminException('신청을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }
      const { status, rejectionReason } = dto;
      if (status === StoreApplicationStatus.APPROVED) {
        // 외부(지갑) 생성이 실패하면 롤백
        try {
          await this.walletService.createWallet(application.storeName, 0);
        } catch (e) {
          throw new AdminException('지갑 생성 실패: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // 상점 계정 생성 (DB 트랜잭션)
        await this.createStoreAccountWithManager(application, queryRunner.manager);
      }
      application.status = status;
      application.rejectionReason = status === StoreApplicationStatus.REJECTED ? rejectionReason : null;
      const updatedApplication = await queryRunner.manager.save(application);
      await queryRunner.commitTransaction();
      return updatedApplication;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async createStoreAccountWithManager(application: StoreApplicationEntity, manager: any): Promise<StoreEntity> {
    const storeName = application.storeName;
    const password = Buffer.from(application.storeName).toString('base64');

    const exist = await manager.findOne(StoreEntity, {
      where: [{ storeName }, { phoneNumber: application.phoneNumber }],
    });
    if(exist) throw new AdminException('상점이름 또는 전화번호가 이미 존재합니다.', HttpStatus.BAD_REQUEST);

    const store = manager.create(StoreEntity, {
      password,
      storeName: application.storeName,
      storeDescription: application.storeDescription,
      storeImage: application.storeImage,
      phoneNumber: application.phoneNumber,
    });

    return manager.save(StoreEntity, store);
  }

  async getStores(): Promise<StoreEntity[]> {
    return this.storeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async toggleStoreStatus(storeId: number): Promise<StoreEntity> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new AdminException('상점을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    store.isActive = !store.isActive;
    return this.storeRepository.save(store);
  }
}