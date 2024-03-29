import { Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { FC, useState } from 'react';
import { BPButton } from 'src/common/components/BPButton';
import { useCheckAuth } from 'src/common/hooks';
import { useCalendarContext } from 'src/common/store/calendar';
import { redirect } from 'src/common/utils';
import { calendarEventProvider, dataProvider } from 'src/providers';
import { calendarIntervalFilter } from '../utils';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { useTranslate } from 'react-admin';
import CalendarCheckboxCGS from './CalendarCheckboxCGS';
type CalendarSyncDialogProps = {
  changeView: () => void;
};

export const CalendarSyncDialog: FC<CalendarSyncDialogProps> = ({ changeView }) => {
  const [isLoading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const {
    currentCalendar: { id: calendarId },
  } = useCalendarContext();
  const translate = useTranslate();

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
  const handleCheck = () => setChecked(!checked);

  return (
    <Dialog open={!isCheckAuthLoading && !isAuthenticated} style={{ textAlign: 'center' }}>
      <img alt='calendar_icon' src={GOOGLE_CALENDAR_ICON} style={{ width: '90px', margin: 'auto', padding: '10px' }} />
      <DialogTitle>
        Votre session Google Agenda a expiré, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV.
      </DialogTitle>
      <DialogContent>
        <CalendarCheckboxCGS checked={checked} handleCheck={handleCheck} />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <BPButton style={{ width: 200 }} onClick={changeView} label='bp.action.notNow' />
        <Button
          disabled={isLoading || !checked}
          endIcon={isLoading && <CircularProgress size={20} sx={{ color: 'white' }} />}
          style={{ width: 270 }}
          color='primary'
          variant='contained'
          onClick={oauth2Init}
        >
          <img alt='calendar_icon_button' src={GOOGLE_CALENDAR_ICON} style={{ width: '20px', paddingRight: '5px' }} />
          {translate('bp.action.sync')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
