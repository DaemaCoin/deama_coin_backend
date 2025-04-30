import { IsNotEmpty } from 'class-validator';

export class SaveDiaryRequest {
  @IsNotEmpty({ message: '이메일은 비어있을 수 없습니다.' })
  detail: string;
}
