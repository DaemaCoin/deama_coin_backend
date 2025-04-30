import { formatInTimeZone } from 'date-fns-tz';

export const generateToday = () => {
  const timeZone = 'Asia/Seoul';
  const formattedDate = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
  return formattedDate;
};

export const generateNow = () => {
  const timeZone = 'Asia/Seoul';
  const formattedDate = formatInTimeZone(new Date(), timeZone, 'yyyy-mm-dd hh:mm:ss');
  return formattedDate;
};