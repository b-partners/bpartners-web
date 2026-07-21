import { downloadSubscriptionInvoices } from '@/providers';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { useNotify } from 'react-admin';
import { SubscriptionInvoiceModalStyle } from './style';

const FIRST_AVAILABLE_YEAR = 2023;

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const toMonthLabel = (yearMonth: string) => {
  const [selectedYear, selectedMonth] = yearMonth.split('-');
  return `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`;
};

interface SubscriptionInvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export const SubscriptionInvoiceModal: FC<SubscriptionInvoiceModalProps> = ({ open, onClose, ...rest }) => {
  const today = dayjs();
  const currentYear = today.year();
  const [year, setYear] = useState(currentYear);
  const notify = useNotify();

  const { isPending, mutate, variables } = useMutation({
    mutationKey: ['subscription', 'invoices'],
    mutationFn: downloadSubscriptionInvoices,
    onSuccess: (fileCount, yearMonth) => {
      if (fileCount === 0) {
        notify(`Aucune facture disponible pour ${toMonthLabel(yearMonth)}.`, { type: 'warning' });
        return;
      }
      notify('Le téléchargement de votre facture a démarré.', { type: 'success' });
    },
    onError: (error: Error) => notify(error.message || 'messages.global.error', { type: 'error' }),
  });

  const years = Array.from({ length: currentYear - FIRST_AVAILABLE_YEAR + 1 }, (_, index) => currentYear - index);
  const isMonthAvailable = (monthIndex: number) => year < currentYear || monthIndex <= today.month();
  const toYearMonth = (monthIndex: number) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth sx={SubscriptionInvoiceModalStyle} {...rest}>
      <DialogTitle className='subscription-invoice-title'>
        <ReceiptLongRoundedIcon className='subscription-invoice-title-icon' />
        Factures de mes abonnements
      </DialogTitle>
      <DialogContent>
        <Box className='subscription-invoice-period'>
          <CalendarMonthRoundedIcon className='subscription-invoice-title-icon' />
          <Typography className='subscription-invoice-period-label'>Période de :</Typography>
          <Select
            size='small'
            value={year}
            name='subscription-invoice-year'
            className='subscription-invoice-year-select'
            onChange={({ target: { value } }) => setYear(Number(value))}
          >
            {years.map(item => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box className='subscription-invoice-months'>
          {MONTHS.map((month, index) => (
            <Box key={month} className={`subscription-invoice-month ${isMonthAvailable(index) ? 'is-available' : 'is-unavailable'}`}>
              <Typography className='subscription-invoice-month-name'>{month}</Typography>
              {isMonthAvailable(index) ? (
                <Button
                  variant='outlined'
                  className='subscription-invoice-action'
                  name={`download-subscription-invoice-${toYearMonth(index)}`}
                  disabled={isPending}
                  startIcon={
                    isPending && variables === toYearMonth(index) ? <CircularProgress color='inherit' size={16} /> : <DownloadRoundedIcon fontSize='small' />
                  }
                  onClick={() => mutate(toYearMonth(index))}
                >
                  Télécharger
                </Button>
              ) : (
                <Button
                  disabled
                  variant='outlined'
                  className='subscription-invoice-action'
                  name={`unavailable-subscription-invoice-${toYearMonth(index)}`}
                  startIcon={<ScheduleRoundedIcon fontSize='small' />}
                >
                  Indisponible
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions className='subscription-invoice-actions'>
        <Button onClick={onClose} name='subscription-invoice-close' className='subscription-invoice-close'>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
