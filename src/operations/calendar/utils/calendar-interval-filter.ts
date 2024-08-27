import { getCurrentMonth, getCurrentWeek } from '@/common/utils';
import { DatesSetArg } from '@fullcalendar/core';

export const calendarIntervalFilter = (dateInfo?: DatesSetArg, filterValues: any = {}) => {
  const { monday, nextMonday } = getCurrentWeek();
  const { begin, end } = getCurrentMonth();
  const viewType = dateInfo?.view?.type;

  if (viewType === 'dayGridMonth') {
    return {
      ...filterValues,
      start_gte: begin,
      start_lte: end,
    };
  }
  return {
    ...filterValues,
    start_gte: monday,
    start_lte: nextMonday,
  };
};
