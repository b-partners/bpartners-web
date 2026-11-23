import { downloadSubscriptionInvoices, getSubscriptionInvoiceSummaries } from '@/providers';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { Box, Button, CircularProgress, MenuItem, Select, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { BillingSection } from './BillingSection';
import { SubscriptionInvoiceDownloadDialog } from './SubscriptionInvoiceDownloadDialog';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const toMonthLabel = (yearMonth: string) => {
  const [selectedYear, selectedMonth] = yearMonth.split('-');
  return `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`;
};

const toInvoiceCountLabel = (count: number) => (count > 1 ? `${count} factures` : '1 facture');

export const BillingInvoicesSection = () => {
  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>();
  const notify = useNotify();

  const { data: summaries, isLoading } = useQuery({
    queryKey: ['subscription', 'invoice-summaries', selectedYear],
    queryFn: () => getSubscriptionInvoiceSummaries(selectedYear),
    placeholderData: previous => previous,
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ['subscription', 'invoices'],
    mutationFn: downloadSubscriptionInvoices,
    onSuccess: (fileCount, yearMonth) => {
      setSelectedYearMonth(undefined);
      if (fileCount === 0) {
        notify(`Aucune facture disponible pour ${toMonthLabel(yearMonth)}.`, { type: 'warning' });
        return;
      }
      notify('Le téléchargement de votre facture a démarré.', { type: 'success' });
    },
    onError: (error: Error) => notify(error.message || 'messages.global.error', { type: 'error' }),
  });

  const year = selectedYear ?? summaries?.actualYear;
  const years = [...new Set([...(summaries?.availableYears ?? []), ...(year ? [year] : [])])].sort((a, b) => b - a);
  const months = summaries?.months ?? [];
  const toYearMonth = (month: number) => `${year}-${String(month).padStart(2, '0')}`;
  const selectedMonth = months.find(({ month }) => !!month && toYearMonth(month) === selectedYearMonth);

  return (
    <BillingSection icon={<ReceiptLongRoundedIcon />} title='Mes factures' subtitle='Téléchargez les factures de vos abonnements et de vos achats de crédits.'>
      {isLoading ? (
        <Box className='billing-invoice-loading'>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Box className='billing-invoice-period'>
            <CalendarMonthRoundedIcon fontSize='small' />
            <Typography className='billing-invoice-period-label'>Période de :</Typography>
            <Select
              size='small'
              value={year ?? ''}
              name='billing-invoice-year'
              className='billing-invoice-year-select'
              onChange={({ target: { value } }) => setSelectedYear(Number(value))}
            >
              {years.map(item => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box className='billing-invoice-months'>
            {months.map(({ month = 0, invoiceCount = 0 }) => {
              const isAvailable = invoiceCount > 0;
              return (
                <Box key={month} className={`billing-invoice-month ${isAvailable ? 'is-available' : 'is-unavailable'}`}>
                  <Box className='billing-invoice-month-info'>
                    <Typography className='billing-invoice-month-name'>{MONTHS[month - 1]}</Typography>
                    {isAvailable && <Typography className='billing-invoice-month-count'>{toInvoiceCountLabel(invoiceCount)}</Typography>}
                  </Box>
                  {isAvailable ? (
                    <Button
                      variant='outlined'
                      className='billing-invoice-action'
                      name={`download-subscription-invoice-${toYearMonth(month)}`}
                      startIcon={<DownloadRoundedIcon fontSize='small' />}
                      onClick={() => setSelectedYearMonth(toYearMonth(month))}
                    >
                      Télécharger
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant='outlined'
                      className='billing-invoice-action'
                      name={`unavailable-subscription-invoice-${toYearMonth(month)}`}
                      startIcon={<ScheduleRoundedIcon fontSize='small' />}
                    >
                      Indisponible
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        </>
      )}
      <SubscriptionInvoiceDownloadDialog
        monthLabel={selectedYearMonth && selectedMonth ? toMonthLabel(selectedYearMonth) : undefined}
        invoices={selectedMonth?.invoices ?? []}
        isPending={isPending}
        onCancel={() => setSelectedYearMonth(undefined)}
        onConfirm={() => selectedYearMonth && mutate(selectedYearMonth)}
      />
    </BillingSection>
  );
};
