import { Sync as SyncIcon } from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { BPButton } from 'src/common/components/BPButton';
import { useCheckAuth } from 'src/common/hooks';
import { useCalendarContext } from 'src/common/store/calendar';
import { redirect } from 'src/common/utils';
import { calendarEventProvider, dataProvider } from 'src/providers';
import { calendarIntervalFilter } from '../utils';
type CalendarSyncDialogProps = {
  changeView: () => void;
};

export const CalendarSyncDialog: FC<CalendarSyncDialogProps> = ({ changeView }) => {
  const [isLoading, setLoading] = useState(false);
  const {
    currentCalendar: { id: calendarId },
  } = useCalendarContext();

  const fetcher = async () => {
    const { start_gte, start_lte } = calendarIntervalFilter();
    return await calendarEventProvider.getList(null, null, { calendarId, start_gte, start_lte });
  };
  const { isLoading: isCheckAuthLoading, isAuthenticated } = useCheckAuth(fetcher);

  const oauth2Init = () => {
    setLoading(true);
    dataProvider.oauth2Init('calendar').then(({ data: { redirectionUrl } }) => {
      redirect(redirectionUrl);
    });
  };

  return (
    <Dialog open={!isCheckAuthLoading && !isAuthenticated}>
      <DialogTitle></DialogTitle>
      <DialogContent>
        <Typography width={550} textAlign='justify' mb={1}>
          Votre session Google Agenda a expiré, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <BPButton style={{ width: 200 }} onClick={changeView} label='bp.action.notNow' />
        <BPButton style={{ width: 200 }} onClick={oauth2Init} endIcon={<SyncIcon />} label='bp.action.sync' isLoading={isLoading} />
      </DialogActions>
    </Dialog>
  );
};
