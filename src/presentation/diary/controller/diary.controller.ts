import { Body, Controller, Get } from '@nestjs/common';
import { DiaryService } from 'src/application/diary/diary.service';
import { GetUserId } from 'src/common/decorator/get-user-id';
import { SaveDiaryRequest } from '../dto/request/save-diary.request';

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  async saveDiary(
    @GetUserId() userId: string,
    @Body() saveDiaryRequest: SaveDiaryRequest,
  ) {
    return await this.diaryService.saveDiary(userId, saveDiaryRequest);
  }
}
