import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { dayOfWeeks } from 'src/common/set/day-of-weeks';

export class CreatePledgeRequest {
  @IsNotEmpty({ message: '약속의 이름을 지어주세요' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '날짜 형식을 지정해주세요' })
  @IsIn(dayOfWeeks, { each: true })
  dayOfWeek: string[];
}
