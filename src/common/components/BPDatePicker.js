import { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';

const BPDatePicker = props => {
  const { views, label, setDate } = props;
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));

  useEffect(() => {
    const checkDate = () => {
      if (selectedDate) {
        const { $M, $y } = selectedDate;
        !isNaN($M + $y) && setDate({ year: $y, month: $M });
      }
    };
    checkDate();
  }, [selectedDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fr'>
      <DatePicker
        views={views}
        label={label}
        minDate={dayjs('1900-01-01')}
        value={selectedDate}
        onChange={newValue => {
          setSelectedDate(newValue);
        }}
        renderInput={params => <TextField {...params} name='datePicker' />}
      />
    </LocalizationProvider>
  );
};

export default BPDatePicker;
