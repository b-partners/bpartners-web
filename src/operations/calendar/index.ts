import { CalendarList } from './CalendarList';
import { CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { CalendarEdit } from './CalendarEdit';
import { CalendarCreate } from './CalendarCreate';

export const calendar = {
  list: CalendarList,
  icon: CalendarMonthIcon,
  options: { label: 'Mon agenda' },
};

export const calendarEvent = {
  edit: CalendarEdit,
  create: CalendarCreate,
};
