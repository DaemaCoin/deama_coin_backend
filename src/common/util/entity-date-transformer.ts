import { ValueTransformer } from 'typeorm';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const FMT = 'yyyy-MM-dd HH:mm:ssXXX';

export const EntityDateTransformer: ValueTransformer = {
  to: (value: Date | string | null): Date | null => {
    if (!value) return null;
    return new Date(value);
  },
  from: (dbValue: Date | string | null): string | null => {
    if (!dbValue) return null;
    const utcDate = typeof dbValue === 'string' ? new Date(dbValue) : dbValue;
    const zoned = toZonedTime(utcDate, 'Asia/Seoul');
    return formatInTimeZone(zoned, 'Asia/Seoul', FMT);
  },
};
