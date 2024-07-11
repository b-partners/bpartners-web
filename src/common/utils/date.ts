import { endOfMonth, isMonday, isSunday, nextMonday as findNextMonday, previousMonday, set } from 'date-fns';
import { format, formatInTimeZone } from 'date-fns-tz';
import { getCached } from '@/providers';

const INPUT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const formatDatetime = (date: Date) => date.toLocaleString('pt-BR');

export const formatDate = (date: Date) => date.toLocaleString('pt-BR').split(' ')[0].replace(/,/g, '');

/**
 * Create new date in 8601 format
 * @param date 'yyyy-mm-dd'
 * @param time 'hh:mm:ss'
 * @returns date in 8601 format
 * @ex '2023-01-25T20:10:20.000Z'
 */
export const formatDateTo8601 = (date: String, time: String) => date && new Date(date + 'T' + time).toISOString();
export const getNextMonthDate = (date: string) => {
  const currentMonth = date.split('-')[1];
  const currentDate = new Date(date.split('T')[0]);
  currentDate.setMonth(+currentMonth);
  return currentDate.toLocaleDateString('fr-ca').split('T')[0];
};

export const dateForInput = (date: Date, timezone?: string) => formatInTimeZone(date, timezone || getCached.timeZone(), INPUT_DATETIME_FORMAT);
export const dateForInputWithoutTimezone = (date: Date) => format(date, INPUT_DATETIME_FORMAT);

export const getCurrentWeek = () => {
  const currentDate = new Date();

  const monday = isMonday(currentDate) ? currentDate : previousMonday(currentDate);
  const nextMonday = isSunday(currentDate) ? currentDate : findNextMonday(currentDate);

  return { monday, nextMonday };
};

export const getCurrentMonth = () => {
  const currentDate = new Date();

  const end = endOfMonth(currentDate);
  const begin = set(currentDate, { date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

  return { end, begin };
};
