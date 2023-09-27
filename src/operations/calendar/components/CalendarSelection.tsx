/* eslint-disable react-hooks/exhaustive-deps */
import { MenuItem, TextField } from '@mui/material';
import { Calendar } from 'bpartners-react-client';
import { FC, useEffect } from 'react';
import { useCalendarContext } from 'src/common/store';

type CalendarSelectionProps = {
  onChange: (calendar: Calendar) => void;
  value: Calendar;
};

export const CalendarSelection: FC<CalendarSelectionProps> = ({ onChange }) => {
  const { currentCalendar, eventList } = useCalendarContext();

  console.log({ currentCalendar, eventList });

  useEffect(() => {
    if (!currentCalendar) {
      onChange(eventList[0]);
    }
  }, []);

  return (
    <TextField sx={{ minWidth: 300 }} select value={currentCalendar?.summary}>
      {eventList &&
        eventList.map(calendar => (
          <MenuItem onClick={() => onChange(calendar)} selected={currentCalendar?.id === calendar?.id} key={calendar?.id} value={calendar?.summary}>
            {calendar?.summary}
          </MenuItem>
        ))}
    </TextField>
  );
};
