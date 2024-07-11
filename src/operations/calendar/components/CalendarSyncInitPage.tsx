import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslate } from 'react-admin';
import GOOGLE_CALENDAR_ICON from '@/assets/google_calendar_icon.png';
import { Redirect } from '@/common/utils';
import { dataProvider } from '@/providers';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';
import CalendarCheckboxCGS from './CalendarCheckboxCGS';

export const CalendarSyncInitPage = ({ currentCalendarId }: { currentCalendarId: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const translate = useTranslate();

  const oauth2Init = async () => {
    setLoading(true);
    dataProvider.oauth2Init('calendar', currentCalendarId).then(({ data: { redirectionUrl } }) => {
      Redirect.toURL(redirectionUrl);
    });
  };
  const handleCheck = () => setChecked(!checked);

  return (
    <Box sx={PRIMARY_CONTAINER}>
      <Paper sx={SECONDARY_CONTAINER} style={{ flexDirection: 'column' }}>
        <img alt='calendar_icon' src={GOOGLE_CALENDAR_ICON} style={{ width: '90px', margin: 'auto', padding: '10px' }} />
        <Box sx={{ textAlign: 'center', margin: '20px' }}>
          <Typography mb={1}>
            Il semble que c'est la première fois que vous utilisez BPartners, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité
            de vos prochains RDV.
          </Typography>
          <CalendarCheckboxCGS checked={checked} handleCheck={handleCheck} />
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
