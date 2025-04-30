import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { dayOfWeeks } from 'src/common/set/day-of-weeks';

export class GetPledgesBodyRequest {
  @IsNotEmpty()
  @IsOptional()
  @IsNotEmpty({ message: '날짜 형식을 지정해주세요' })
  @IsIn(dayOfWeeks, { each: true })
  dayOfWeek?: string[];
}
