import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreApplicationEntity, StoreApplicationStatus } from '../store/entity/store-application.entity';
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

  // 입점 신청 목록 조회
  async getStoreApplications(): Promise<StoreApplicationEntity[]> {
    return this.storeApplicationRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // 입점 신청 승인/거절
  async updateStoreApplicationStatus(
    applicationId: number, 
    dto: UpdateStoreApplicationStatusDto
  ): Promise<StoreApplicationEntity> {
    const application = await this.storeApplicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new AdminException('신청을 찾을 수 없습니다.', 404);
    }

    // 상태 업데이트
    application.status = dto.status as StoreApplicationStatus;
    if (dto.status === 'REJECTED') {
      application.rejectionReason = dto.rejectionReason;
    }

    const updatedApplication = await this.storeApplicationRepository.save(application);

    // 승인된 경우 상점 계정 생성
    if (dto.status === 'APPROVED') {
      await this.createStoreAccount(application);
    }

    this.walletService.createWallet(application.storeName, 0);

    return updatedApplication;
  }

  // 상점 계정 생성
  private async createStoreAccount(application: StoreApplicationEntity): Promise<StoreEntity> {
    const storeId = application.storeName;
    const password = Buffer.from(application.storeName).toString('base64');

    const store = this.storeRepository.create({
      storeId,
      password,
      storeName: application.storeName,
      storeDescription: application.storeDescription,
      storeImage: application.storeImage,
      phoneNumber: application.phoneNumber,
    });

    return this.storeRepository.save(store);
  }

  // 상점 목록 조회
  async getStores(): Promise<StoreEntity[]> {
    return this.storeRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // 상점 활성화/비활성화
  async toggleStoreStatus(storeId: number): Promise<StoreEntity> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId }
    });

    if (!store) {
      throw new AdminException('상점을 찾을 수 없습니다.', 404);
    }

    store.isActive = !store.isActive;
    return this.storeRepository.save(store);
  }
} 