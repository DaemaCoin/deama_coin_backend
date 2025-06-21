import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const application = await this.storeApplicationRepository.findOne({
      where: { id: applicationId, status: StoreApplicationStatus.PENDING },
    });

    if (!application) {
      throw new AdminException('신청을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    const { status, rejectionReason } = dto;

    application.status = status;
    application.rejectionReason = status === StoreApplicationStatus.REJECTED ? rejectionReason : null;

    const updatedApplication = await this.storeApplicationRepository.save(application);

    if (status === StoreApplicationStatus.APPROVED) {
      await this.walletService.createWallet(application.storeName, 0);
      await this.createStoreAccount(application);
    }

    return updatedApplication;
  }

  private async createStoreAccount(application: StoreApplicationEntity): Promise<StoreEntity> {
    const storeName = application.storeName;
    const password = Buffer.from(application.storeName).toString('base64');

    const exist = await this.storeRepository.findOne({
      where: [{ storeName }, { phoneNumber: application.phoneNumber }],
    });
    if(exist) throw new AdminException('상점이름 또는 전화번호가 이미 존재합니다.', HttpStatus.BAD_REQUEST);

    const store = this.storeRepository.create({
      password,
      storeName: application.storeName,
      storeDescription: application.storeDescription,
      storeImage: application.storeImage,
      phoneNumber: application.phoneNumber,
    });

    return this.storeRepository.save(store);
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