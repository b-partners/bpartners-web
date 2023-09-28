import { Box, SxProps } from '@mui/material';
import { CalendarSelection } from './CalendarSelection';
import { CalendarSyncButton } from './CalendarSyncButton';

const CONTAINER: SxProps = {
  width: 'fit-content',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
};

export const CalendarListAction = () => {
  return (
    <Box sx={CONTAINER}>
      <CalendarSelection />
      <CalendarSyncButton />
    </Box>
  );
};
