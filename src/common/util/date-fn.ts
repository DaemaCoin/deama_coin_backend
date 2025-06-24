import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';

export const generateToday = () => {
  const timeZone = 'Asia/Seoul';
  const formattedDate = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
  return formattedDate;
};

export const formattedDate = (date: Date, format: string) => {
  const timeZone = 'Asia/Seoul';
  if (!date) return null;
  return formatInTimeZone(date, timeZone, format);
};

export const getTodayUtcRange = () => {
  const timeZone = 'Asia/Seoul';
  const now = new Date();

  const startKST = startOfDay(toZonedTime(now, timeZone));
  const endKST = endOfDay(toZonedTime(now, timeZone));

  const utcStart = new Date(startKST.toISOString());
  const utcEnd = new Date(endKST.toISOString());

  return { utcStart, utcEnd };
};
