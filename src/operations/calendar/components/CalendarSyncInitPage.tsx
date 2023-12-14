import { Box, Button, Paper, Typography, FormGroup, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { useState } from 'react';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { redirect } from 'src/common/utils';
import { dataProvider } from 'src/providers';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';
import { TRANSPARENT_BUTTON_STYLE } from 'src/security/style';
import { useTranslate } from 'react-admin';

export const CalendarSyncInitPage = ({ currentCalendarId }: { currentCalendarId: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const translate = useTranslate();

  const oauth2Init = async () => {
    setLoading(true);
    dataProvider.oauth2Init('calendar', currentCalendarId).then(({ data: { redirectionUrl } }) => {
      redirect(redirectionUrl);
    });
  };

  return (
    <Box sx={PRIMARY_CONTAINER}>
      <Paper sx={SECONDARY_CONTAINER} style={{ flexDirection: 'column' }}>
        <img alt='calendar_icon' src={GOOGLE_CALENDAR_ICON} style={{ width: '90px', margin: 'auto', padding: '10px' }} />
        <Box sx={{ textAlign: 'center', margin: '20px' }}>
          <Typography mb={1}>
            Il semble que c'est la première fois que vous utilisez BPartners, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité
            de vos prochains RDV.
          </Typography>
          <FormGroup onChange={() => setChecked(!checked)}>
            <FormControlLabel
              data-testid='control-cgs'
              style={{ alignItems: 'start' }}
              control={<Checkbox />}
              label={
                <>
                  <Typography style={{ color: '#0009', fontSize: '14px', paddingBottom: '20px' }}>
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
                      <Typography style={{ fontSize: '13px', textDecoration: 'underline', paddingBottom: '2px' }}> https://legal.bpartners.app/</Typography>
                    </Button>
                  </Typography>
                </>
              }
              checked={checked}
            />
          </FormGroup>
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
        </Box>
      </Paper>
    </Box>
  );
};
