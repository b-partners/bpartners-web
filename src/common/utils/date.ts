import { getCached } from '@/providers';
import { endOfMonth, nextMonday as findNextMonday, isMonday, isSunday, previousMonday, set } from 'date-fns';
import { format, formatInTimeZone } from 'date-fns-tz';

const INPUT_DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const formatDateTime = (date: Date) => date.toLocaleString('pt-BR');

export const formatDate = (date: Date) => date.toLocaleString('pt-BR').split(' ')[0].replace(/,/g, '');
export const formatFrenchDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const getFirstDebitDate = (startDate: Date, endDate: Date): Date => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.getMonth();
  const startYear = start.getFullYear();
  const endMonth = end.getMonth();
  const endYear = end.getFullYear();

  const nextMonth = startMonth === 11 ? 0 : startMonth + 1;
  const nextMonthYear = startMonth === 11 ? startYear + 1 : startYear;

  const sameMonth = endYear === startYear && endMonth === startMonth;

  const endIsBefore5OfNextMonth = endYear === nextMonthYear && endMonth === nextMonth && end.getDate() < 5;

  if (sameMonth || endIsBefore5OfNextMonth) {
    return new Date(nextMonthYear, nextMonth, 5);
  }

  const secondNextMonth = nextMonth === 11 ? 0 : nextMonth + 1;
  const secondNextYear = nextMonth === 11 ? nextMonthYear + 1 : nextMonthYear;
  return new Date(secondNextYear, secondNextMonth, 5);
};

/**
 * Create new date in 8601 format
 * @param date 'yyyy-mm-dd'
 * @param time 'hh:mm:ss'
 * @returns date in 8601 format
 * @ex '2023-01-25T20:10:20.000Z'
 */
export const formatDateTo8601 = (date: string, time: string) => date && new Date(date + 'T' + time).toISOString();
export const getNextMonthDate = (date: string) => {
  const currentMonth = date.split('-')[1];
  const currentDate = new Date(date.split('T')[0]);
  currentDate.setMonth(+currentMonth);
  return currentDate.toLocaleDateString('fr-ca').split('T')[0];
};

export const dateForInput = (date: Date, timezone?: string) => formatInTimeZone(date, timezone || getCached.timeZone(), INPUT_DATE_TIME_FORMAT);
export const dateForInputWithoutTimezone = (date: Date) => format(date, INPUT_DATE_TIME_FORMAT);

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
