import { Sync as SyncIcon } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import GOOGLE_CALENDAR_ICON from 'src/assets/google_calendar_icon.png';
import { BPButton } from 'src/common/components/BPButton';
import { redirect } from 'src/common/utils';
import { dataProvider } from 'src/providers';
import { ICON_CONTAINER, PRIMARY_CONTAINER, SECONDARY_CONTAINER } from '../utils';

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
            Il semble que c'est la première fois que vous utilisez Bpartners, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité
            de vos prochains RDV.
          </Typography>
          <BPButton onClick={oauth2Init} endIcon={<SyncIcon />} label='bp.action.sync' isLoading={isLoading} />
        </Box>
      </Paper>
    </Box>
  );
};
