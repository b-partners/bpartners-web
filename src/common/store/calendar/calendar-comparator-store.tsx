/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog, DialogTitle, Typography } from '@mui/material';
import { Dispatch, FC, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { useListContext } from 'react-admin';
import { getCached } from 'src/providers';
import { TNotSyncCalendarEvent } from 'src/providers/utils';

type RaCalendarComparatorContext = {
  data: TNotSyncCalendarEvent[];
  notSyncData: TNotSyncCalendarEvent[];
  lastStep: number;
  setNotSyncData: Dispatch<SetStateAction<TNotSyncCalendarEvent[]>>;
  setLastStep: Dispatch<SetStateAction<number>>;
};

const getNotSync = (e: TNotSyncCalendarEvent[] = []) => e.filter(event => event.isSynchronized === false);
const CalendarComparatorContext = createContext<RaCalendarComparatorContext>(null);
export const useCalendarComparatorContext = () => useContext(CalendarComparatorContext);

export const CalendarComparatorProvider: FC = ({ children }) => {
  const { data } = useListContext();
  const [notSyncData, setNotSyncData] = useState<TNotSyncCalendarEvent[]>([]);
  const [lastStep, setLastStep] = useState(0);

  useEffect(() => {
    if (getCached.calendarSync()) {
      setNotSyncData(getNotSync(data) || []);
      setLastStep(notSyncData.length);
    }
  }, [data, setNotSyncData]);

  return (
    <CalendarComparatorContext.Provider value={{ data, notSyncData, setNotSyncData, lastStep, setLastStep }}>
      <Dialog open={notSyncData.length > 0} maxWidth={false}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Comparaison</Typography>
          <Typography>
            {lastStep + 1}/{notSyncData.length}
          </Typography>
        </DialogTitle>
        {children}
      </Dialog>
    </CalendarComparatorContext.Provider>
  );
};
