import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, CircularProgress, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { FC, useState } from 'react';
import { BPButton } from 'src/common/components/BPButton';
import { useCheckAuth } from 'src/common/hooks';
import { useCalendarContext } from 'src/common/store/calendar';
import { redirect } from 'src/common/utils';
import { calendarEventProvider, dataProvider } from 'src/providers';
import { calendarIntervalFilter } from '../utils';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { TRANSPARENT_BUTTON_STYLE } from 'src/security/style';
import { useTranslate } from 'react-admin';
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

  return (
    <Dialog open={!isCheckAuthLoading && !isAuthenticated} style={{ textAlign: 'center' }}>
      <img alt='calendar_icon' src={GOOGLE_CALENDAR_ICON} style={{ width: '90px', margin: 'auto', padding: '10px' }} />
      <DialogTitle>
        Votre session Google Agenda a expiré, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV.
      </DialogTitle>
      <DialogContent>
        <FormGroup onChange={() => setChecked(!checked)}>
          <FormControlLabel
            data-testid='control-cgs'
            style={{ alignItems: 'start' }}
            control={<Checkbox />}
            label={
              <>
                <Typography style={{ color: '#0009', fontSize: '14px' }}>
                  En continuant, vous acceptez que BPartners transmette anonymement vos informations à&nbsp;
                  <Button
                    id='passwordReset'
                    sx={{ ...TRANSPARENT_BUTTON_STYLE }}
                    onClick={() => {
                      window.open('https://adresse.data.gouv.fr/base-adresse-nationale#4.4/46.9/1.7', '_blank', 'noopener');
                    }}
                  >
                    <Typography style={{ fontSize: '13px', textDecoration: 'underline', paddingBottom: '2px' }}> la Base Adresse Nationale</Typography>
                  </Button>{' '}
                  afin de générer des nouveaux prospects.
                  <br />
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
              </>
            }
            checked={checked}
          />
        </FormGroup>
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
