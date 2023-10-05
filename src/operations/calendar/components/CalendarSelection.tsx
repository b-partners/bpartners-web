/* eslint-disable react-hooks/exhaustive-deps */
import { MenuItem, TextField } from '@mui/material';
import { Calendar } from 'bpartners-react-client';
import { FC, useEffect } from 'react';
import { useCalendarContext } from 'src/common/store/calendar';

export const CalendarSelection: FC = () => {
  const { currentCalendar, eventList, setCalendar } = useCalendarContext();

  useEffect(() => {
    if (!currentCalendar) {
      setCalendar && setCalendar(eventList[0]);
    }
  }, []);

  const handleClick = (calendar: Calendar) => () => setCalendar && setCalendar(calendar);
  useEffect(() => {
    console.log(currentCalendar);
  }, []);

  return (
    <TextField sx={{ minWidth: 300 }} select value={currentCalendar?.summary}>
      {eventList &&
        eventList.map(calendar => (
          <MenuItem onClick={handleClick(calendar)} selected={currentCalendar?.id === calendar?.id} key={calendar?.id} value={calendar?.summary}>
            {calendar?.summary}
          </MenuItem>
        ))}
    </TextField>
  );
};
