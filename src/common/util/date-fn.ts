import { formatInTimeZone } from 'date-fns-tz';

export const generateToday = () => {
  const timeZone = 'Asia/Seoul';
  const formattedDate = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
  return formattedDate;
};

export const formattedDate = (date: Date, format: string) => {
  const timeZone = 'Asia/Seoul';
  if(!date) return null;
  return formatInTimeZone(date, timeZone, format);
};