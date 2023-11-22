import { Sync as SyncIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { BPButton } from 'src/common/components/BPButton';
import { useCheckAuth } from 'src/common/hooks';
import { useCalendarContext } from 'src/common/store/calendar';
import { redirect } from 'src/common/utils';
import { calendarEventProvider, dataProvider } from 'src/providers';
import { calendarIntervalFilter } from '../utils';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { TRANSPARENT_BUTTON_STYLE } from 'src/security/style';
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
    dataProvider.oauth2Init('calendar', calendarId).then(({ data: { redirectionUrl } }) => {
      redirect(redirectionUrl);
    });
  };

  return (
    <Dialog open={!isCheckAuthLoading && !isAuthenticated} style={{ textAlign: 'center' }}>
      <img alt='calendar_icon' src={GOOGLE_CALENDAR_ICON} style={{ width: '90px', margin: 'auto', padding: '10px' }} />
      <DialogTitle>
        Votre session Google Agenda a expiré, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV.
      </DialogTitle>
      <DialogContent>
        <Typography style={{ color: '#0009', fontSize: '14px' }}>
          En continuant, vous acceptez que BPartners transmette les adresses récoltées depuis vos agendas à des services tiers sécurisés,{' '}
          <strong>de façon anonyme</strong>, pour générer des nouveaux prospects. <br />
          Pour plus d'infos, consultez&nbsp;
          <Button
            id='passwordReset'
            sx={{ ...TRANSPARENT_BUTTON_STYLE }}
            onClick={() => {
              window.open('https://legal.bpartners.app/', '_blank', 'noopener');
            }}
          >
            <Typography style={{ fontSize: '13px', textDecoration: 'underline' }}> https://legal.bpartners.app/</Typography>
          </Button>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <BPButton style={{ width: 200 }} onClick={changeView} label='bp.action.notNow' />
        <BPButton style={{ width: 250 }} onClick={oauth2Init} endIcon={<SyncIcon />} label='bp.action.sync' isLoading={isLoading} />
      </DialogActions>
    </Dialog>
  );
};
