/* eslint-disable react-hooks/exhaustive-deps */
import { DialogContent, Paper, Typography } from '@mui/material';
import { BP_COLOR } from 'src/bp-theme';
import { CalendarComparatorProvider } from 'src/common/store/calendar';
import { CalendarComparaisonForm } from '.';

export const CalendarEventComparator = () => {
  return (
    <CalendarComparatorProvider>
      <DialogContent sx={{ overflow: 'hidden' }}>
        <Paper
          sx={{
            p: 2,
            m: 3,
            background: BP_COLOR['solid_grey'],
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            outline: 'none',
            border: 'none',
          }}
        >
          <Typography textAlign='justify'>
            Il semble y avoir des différences entre l'agenda de chez google et de chez bpartners. Pour synchroniser veuillez cliquer sur l'une des options qui
            ne présentent pas de bordure verte parmi les choix disponibles.
          </Typography>
        </Paper>
      </DialogContent>
      <CalendarComparaisonForm />
    </CalendarComparatorProvider>
  );
};
