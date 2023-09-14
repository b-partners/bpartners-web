import { MenuItem, TextField } from '@mui/material';
import { Calendar } from 'bpartners-react-client';
import { FC, useEffect } from 'react';

type CalendarSelectionProps = {
  onChange: (calendar: Calendar) => void;
  value: Calendar;
  data: Calendar[];
};

export const CalendarSelection: FC<CalendarSelectionProps> = ({ onChange, value, data }) => {
  useEffect(() => {
    onChange(data && data[0]);
  }, [data]);

  return (
    <TextField select value={value}>
      {data &&
        data.map(calendar => (
          <MenuItem onClick={() => onChange(calendar)} key={calendar.id} value={value.id}>
            {calendar.summary}
          </MenuItem>
        ))}
    </TextField>
  );
};
