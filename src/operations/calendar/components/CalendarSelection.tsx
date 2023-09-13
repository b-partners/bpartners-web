import { MenuItem, TextField } from '@mui/material';
import { Calendar } from 'bpartners-react-client';
import { FC, useEffect } from 'react';
import { useGetList } from 'react-admin';

type CalendarSelectionProps = {
  onChange: (calendar: Calendar) => void;
  value: Calendar;
};

export const CalendarSelection: FC<CalendarSelectionProps> = ({ onChange, value }) => {
  const { data } = useGetList('calendar');

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
