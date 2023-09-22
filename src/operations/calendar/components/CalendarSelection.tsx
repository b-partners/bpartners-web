/* eslint-disable react-hooks/exhaustive-deps */
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
    if (!value) {
      onChange(data[0]);
    }
  }, []);

  return (
    <TextField sx={{ minWidth: 300 }} select value={value?.summary}>
      {data &&
        data.map(calendar => (
          <MenuItem onClick={() => onChange(calendar)} selected={value?.id === calendar?.id} key={calendar?.id} value={calendar?.summary}>
            {calendar?.summary}
          </MenuItem>
        ))}
    </TextField>
  );
};
