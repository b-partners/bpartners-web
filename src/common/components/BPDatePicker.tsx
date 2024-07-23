import { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';
import { CalendarPickerProps, DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';

export type BPDatePickerProps<tDate> = Pick<CalendarPickerProps<tDate>, 'views'> & {
  label: string;
  setDate: (args: { year: number; month: number }) => void;
};

const BPDatePicker = (props: BPDatePickerProps<any>) => {
  const { views, label, setDate } = props;
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()));

  useEffect(() => {
    const checkDate = () => {
      if (selectedDate) {
        const month = selectedDate.month();
        const year = selectedDate.year();
        !isNaN(month + year) && setDate({ year, month });
      }
    };
    checkDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
