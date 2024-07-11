import { DatesSetArg } from '@fullcalendar/core';
import { getCurrentMonth, getCurrentWeek } from '@/common/utils';

export const calendarIntervalFilter = (dateInfo?: DatesSetArg, filterValues: any = {}) => {
  const { monday, nextMonday } = getCurrentWeek();
  const { begin, end } = getCurrentMonth();
  const viewType = dateInfo?.view?.type;

  switch (viewType) {
    case 'dayGridMonth':
      return {
        ...filterValues,
        start_gte: begin,
        start_lte: end,
      };
    default:
      return {
        ...filterValues,
        start_gte: monday,
        start_lte: nextMonday,
      };
  }
};
