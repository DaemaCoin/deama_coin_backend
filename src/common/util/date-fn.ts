import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';

export const generateToday = () => {
  const timeZone = 'Asia/Seoul';
  const formattedDate = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
  return formattedDate;
};

export const getCurrentKoreanTime = () => {
  const timeZone = 'Asia/Seoul';
  const utcDate = new Date();
  return toZonedTime(utcDate, timeZone);
};

export const formattedDate = (date: Date, format: string) => {
  const timeZone = 'Asia/Seoul';
  if (!date) return null;
  return formatInTimeZone(date, timeZone, format);
};

export const getTodayStartEnd = () => {
  const todayDate = new Date(generateToday());
  const start = startOfDay(todayDate);
  const end = endOfDay(todayDate);
  return { start, end };
};
