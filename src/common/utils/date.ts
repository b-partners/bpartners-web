export const formatDateTime = (date: Date) => date.toLocaleString('pt-BR');
export const formatDateTimeWithoutSec = (_date: string): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = new Date(_date);
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
};
export const formatDate = (date: Date) => date.toLocaleString('pt-BR').split(' ')[0].replace(/,/g, '');
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
