import { Box, Button, Typography, SxProps, CircularProgress } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useState } from 'react';
import { redirect } from 'src/common/utils';
import { dataProvider } from 'src/providers';
import { PRIMARY_CONTAINER, SECONDARY_CONTAINER } from './styles';

export const CalendarSynchronisation = () => {
  const [isLoading, setLoading] = useState(false);

  const oauth2Init = () => {
    setLoading(true);
    dataProvider.oauth2Init('calendar').then(({ data: { redirectionUrl } }) => {
      redirect(redirectionUrl);
    });
  };

  return (
    <Box sx={PRIMARY_CONTAINER}>
      <Box sx={SECONDARY_CONTAINER}>
        <Typography variant='h5' mb={4}>
          Me synchroniser avec mon agenda google
        </Typography>
        <Button
          sx={{ paddingInline: 2 }}
          endIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Google />}
          disabled={isLoading}
          onClick={oauth2Init}
        >
          Se connecter
        </Button>
      </Box>
    </Box>
  );
};
