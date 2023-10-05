import { Sync as SyncIcon } from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { BPButton } from 'src/common/components/BPButton';
import { useCheckAuth } from 'src/common/hooks';
import { useCalendarContext } from 'src/common/store/calendar';
import { redirect } from 'src/common/utils';
import { calendarProvider, dataProvider } from 'src/providers';

export const CalendarSyncDialog = () => {
  const [isLoading, setLoading] = useState(false);
  const {
    currentCalendar: { id: calendarId },
  } = useCalendarContext();

  const fetcher = async () => await calendarProvider.getList(null, null, { calendarId });
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
          Votre session Google Agenda a expiré, veuillez synchroniser votre agenda pour obtenir de RDV prospects à proximité de vos prochains RDV.
        </Typography>
      </DialogContent>
      <DialogActions>
        <BPButton style={{ width: 200 }} onClick={oauth2Init} endIcon={<SyncIcon />} label='bp.action.sync' isLoading={isLoading} />
      </DialogActions>
    </Dialog>
  );
};
