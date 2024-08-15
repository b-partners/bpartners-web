/* eslint-disable react-hooks/exhaustive-deps */
import { useCalendarContext } from '@/common/store';
import { Calendar } from '@bpartners/typescript-client';
import { MenuItem, TextField } from '@mui/material';
import { FC, useEffect } from 'react';

export const CalendarSelection: FC = () => {
  const { currentCalendar, eventList, setCalendar } = useCalendarContext();
  useEffect(() => {
    if (!currentCalendar) {
      setCalendar && setCalendar(eventList[0]);
    }
  }, []);

  const handleClick = (calendar: Calendar) => () => setCalendar && setCalendar(calendar);

  return (
    <TextField sx={{ minWidth: 300 }} select value={currentCalendar?.summary}>
      {eventList?.map(calendar => (
        <MenuItem onClick={handleClick(calendar)} selected={currentCalendar?.id === calendar?.id} key={calendar?.id} value={calendar?.summary}>
          {calendar?.summary}
        </MenuItem>
      ))}
    </TextField>
  );
};
