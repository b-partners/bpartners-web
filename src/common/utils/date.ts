export const formatDatetime = (date: Date) => date.toLocaleString('pt-BR');

export const formatDate = (date: Date) => date.toLocaleString('pt-BR').split(' ')[0];

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

export const dateForInput = (date: Date) => date.toISOString().split('.')[0];
