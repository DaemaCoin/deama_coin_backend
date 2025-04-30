import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class GetPledgesRequest {
  @IsNotEmpty()
  @IsOptional()
  @Min(0, { message: '음수인 페이지는 없어요' })
  @IsNumber({}, { message: 'page는 숫자로 되어 있어야 합니다.' })
  page?: number;
}
