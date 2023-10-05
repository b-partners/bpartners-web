import { Box, Paper, Typography } from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { BPButton } from 'src/common/components/BPButton';
import { ICON_CONTAINER, PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';
import { useState } from 'react';
import { dataProvider } from 'src/providers';
import { redirect } from 'src/common/utils';

export const CalendarSyncInitPage = () => {
  const [isLoading, setLoading] = useState(false);

  const oauth2Init = () => {
    setLoading(true);
    dataProvider.oauth2Init('calendar').then(({ data: { redirectionUrl } }) => {
      redirect(redirectionUrl);
    });
  };
  return (
    <Box sx={PRIMARY_CONTAINER}>
      <Paper sx={SECONDARY_CONTAINER}>
        <Box sx={ICON_CONTAINER}>
          <img alt='calendar_icon' src={GOOGLE_CALENDAR_ICON} />
        </Box>
        <Box>
          <Typography width={300} textAlign='justify' mb={1}>
            Il semble que c'est la première fois que vous utiliser Bpartners, veuillez synchroniser votre agenda pour obtenir de RDV prospects à proximité de
            vos prochains RDV.
          </Typography>
          <BPButton onClick={oauth2Init} endIcon={<SyncIcon />} label='bp.action.sync' isLoading={isLoading} />
        </Box>
      </Paper>
    </Box>
  );
};
