import { Sync as SyncIcon } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { BPButton } from 'src/common/components/BPButton';
import { redirect } from 'src/common/utils';
import { dataProvider } from 'src/providers';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';
import { TRANSPARENT_BUTTON_STYLE } from 'src/security/style';

export const CalendarSyncInitPage = ({ currentCalendarId }: { currentCalendarId: string }) => {
  const [isLoading, setLoading] = useState(false);

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
        <Box sx={{ textAlign: 'center' }}>
          <Typography mb={1}>
            Il semble que c'est la première fois que vous utilisez BPartners, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité
            de vos prochains RDV.
          </Typography>
          <Typography style={{ color: '#0009', fontSize: '14px', paddingBottom: '20px' }}>
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
          <BPButton onClick={oauth2Init} endIcon={<SyncIcon />} label='bp.action.sync' isLoading={isLoading} />
        </Box>
      </Paper>
    </Box>
  );
};
