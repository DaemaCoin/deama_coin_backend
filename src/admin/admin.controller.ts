import { Controller, Get, Put, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateStoreApplicationStatusDto } from '../store/dto/store-application.dto';
import { ApiKeyGuard } from '../common/guard/api-key.guard';
import { IsPublic } from 'src/common/decorator/is-public';

@ApiTags('admin')
@ApiSecurity('api-key')
@IsPublic()
@UseGuards(ApiKeyGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 입점 신청 목록 조회
  @ApiOperation({ summary: '입점 신청 목록 조회' })
  @ApiResponse({ status: 200, description: '입점 신청 목록 조회 성공' })
  @ApiResponse({ status: 401, description: 'API Key 인증 실패' })
  @Get('store-applications')
  async getStoreApplications() {
    return this.adminService.getStoreApplications();
  }

  // 입점 신청 승인/거절
  @ApiOperation({ summary: '입점 신청 승인/거절' })
  @ApiResponse({ status: 200, description: '상태 업데이트 성공' })
  @ApiResponse({ status: 401, description: 'API Key 인증 실패' })
  @ApiResponse({ status: 404, description: '신청을 찾을 수 없음' })
  @ApiParam({ name: 'id', description: '신청 ID' })
  @ApiBody({ type: UpdateStoreApplicationStatusDto })
  @Patch('store-applications/:id/status')
  async updateStoreApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStoreApplicationStatusDto
  ) {
    return this.adminService.updateStoreApplicationStatus(parseInt(id), dto);
  }

  // 상점 목록 조회
  @ApiOperation({ summary: '상점 목록 조회' })
  @ApiResponse({ status: 200, description: '상점 목록 조회 성공' })
  @ApiResponse({ status: 401, description: 'API Key 인증 실패' })
  @Get('stores')
  async getStores() {
    return this.adminService.getStores();
  }

  // 상점 활성화/비활성화
  @ApiOperation({ summary: '상점 활성화/비활성화' })
  @ApiResponse({ status: 200, description: '상점 상태 변경 성공' })
  @ApiResponse({ status: 401, description: 'API Key 인증 실패' })
  @ApiResponse({ status: 404, description: '상점을 찾을 수 없음' })
  @ApiParam({ name: 'id', description: '상점 ID' })
  @Patch('stores/:id/toggle-status')
  async toggleStoreStatus(@Param('id') id: string) {
    return this.adminService.toggleStoreStatus(parseInt(id));
  }
} 