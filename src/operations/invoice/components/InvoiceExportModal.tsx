import { EnableStatus, InvoiceStatus } from '@bpartners/typescript-client';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  SxProps,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { FC, useState } from 'react';

export const INVOICE_EXPORT_MODAL_STYLE: SxProps = {
  '& .export-content': {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    pt: 1,
    minWidth: '30vw',
  },
  '& .export-field-group': {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  '& .export-field-label': {
    fontWeight: 500,
  },
  '& .export-date-range': {
    display: 'flex',
    gap: 2,
    mt: 1,
    '& > *': {
      flex: 1,
    },
  },
  '& .period-choice': {
    mr: 0,
    '& .MuiFormControlLabel-label': {
      flex: 1,
    },
  },
  '& .period-option': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  '& .period-option-range': {
    color: 'text.secondary',
  },
};

export const PeriodChoice = {
  TODAY: 'TODAY',
  CURRENT_MONTH: 'CURRENT_MONTH',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_4_WEEKS: 'LAST_4_WEEKS',
  LAST_MONTH: 'LAST_MONTH',
  CUSTOM: 'CUSTOM',
} as const;

export type PeriodChoice = (typeof PeriodChoice)[keyof typeof PeriodChoice];

type PeriodRange = { from: Dayjs; to: Dayjs };

const PERIOD_CHOICES: { id: PeriodChoice; name: string; getRange?: () => PeriodRange }[] = [
  { id: PeriodChoice.TODAY, name: "Aujourd'hui", getRange: () => ({ from: dayjs().startOf('day'), to: dayjs().startOf('day') }) },
  { id: PeriodChoice.CURRENT_MONTH, name: 'Mois en cours', getRange: () => ({ from: dayjs().startOf('month'), to: dayjs().startOf('day') }) },
  { id: PeriodChoice.LAST_7_DAYS, name: '7 derniers jours', getRange: () => ({ from: dayjs().startOf('day').subtract(6, 'day'), to: dayjs().startOf('day') }) },
  {
    id: PeriodChoice.LAST_4_WEEKS,
    name: '4 dernières semaines',
    getRange: () => ({ from: dayjs().startOf('day').subtract(27, 'day'), to: dayjs().startOf('day') }),
  },
  {
    id: PeriodChoice.LAST_MONTH,
    name: 'Mois dernier',
    getRange: () => ({ from: dayjs().subtract(1, 'month').startOf('month'), to: dayjs().subtract(1, 'month').endOf('month').startOf('day') }),
  },
  { id: PeriodChoice.CUSTOM, name: 'Personnalisé' },
];

const formatDate = (date: Dayjs) => date.locale('fr').format('D MMM');

const formatRange = ({ from, to }: PeriodRange) => (from.isSame(to, 'day') ? formatDate(from) : `du ${formatDate(from)} au ${formatDate(to)}`);

const INVOICE_STATUS_CHOICES = [
  { id: InvoiceStatus.CONFIRMED, name: 'Facture émise' },
  { id: InvoiceStatus.DRAFT, name: 'Brouillon' },
  { id: InvoiceStatus.PAID, name: 'Payé' },
];

const ENABLE_STATUS_CHOICES = [
  { id: EnableStatus.ENABLED, name: 'Actif' },
  { id: EnableStatus.DISABLED, name: 'Archivé' },
];

export interface InvoiceExportFilters {
  period: PeriodChoice;
  from: Dayjs | null;
  to: Dayjs | null;
  statuses: InvoiceStatus[];
  enableStatus: EnableStatus;
}

interface InvoiceExportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (filters: InvoiceExportFilters) => void;
  isLoading?: boolean;
}

export const InvoiceExportModal: FC<InvoiceExportModalProps> = ({ open, onClose, onSubmit, isLoading = false, ...rest }) => {
  const [period, setPeriod] = useState<PeriodChoice>(PeriodChoice.CURRENT_MONTH);
  const [from, setFrom] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [to, setTo] = useState<Dayjs | null>(dayjs());
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([InvoiceStatus.CONFIRMED]);
  const [enableStatus, setEnableStatus] = useState<EnableStatus>(EnableStatus.ENABLED);

  const isCustom = period === PeriodChoice.CUSTOM;
  const selectedRange = PERIOD_CHOICES.find(({ id }) => id === period)?.getRange?.();
  const exportFrom = isCustom ? from : selectedRange?.from || null;
  const exportTo = isCustom ? to : selectedRange?.to || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' sx={INVOICE_EXPORT_MODAL_STYLE} {...rest}>
      <DialogTitle>Télécharger les factures</DialogTitle>
      <DialogContent>
        <Box className='export-content'>
          <Box className='export-field-group'>
            <Typography className='export-field-label'>Période de création de la facture</Typography>
            <RadioGroup value={period} name='export-invoice-period' onChange={({ target: { value } }) => setPeriod(value as PeriodChoice)}>
              {PERIOD_CHOICES.map(({ id, name, getRange }) => (
                <FormControlLabel
                  key={id}
                  value={id}
                  className='period-choice'
                  control={<Radio />}
                  label={
                    <Box className='period-option'>
                      <Typography>{name}</Typography>
                      {getRange && <Typography className='period-option-range'>{formatRange(getRange())}</Typography>}
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
            {isCustom && (
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fr'>
                <Box className='export-date-range'>
                  <DatePicker
                    label='Date de début'
                    value={from}
                    maxDate={to || undefined}
                    onChange={setFrom}
                    renderInput={params => <TextField {...params} name='export-invoice-from' />}
                  />
                  <DatePicker
                    label='Date de fin'
                    value={to}
                    minDate={from || undefined}
                    onChange={setTo}
                    renderInput={params => <TextField {...params} name='export-invoice-to' />}
                  />
                </Box>
              </LocalizationProvider>
            )}
          </Box>
          <Box className='export-field-group'>
            <Typography className='export-field-label'>Statuts des factures</Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              filterSelectedOptions
              options={INVOICE_STATUS_CHOICES}
              getOptionLabel={({ name }) => name}
              isOptionEqualToValue={(option, selected) => option.id === selected.id}
              value={INVOICE_STATUS_CHOICES.filter(({ id }) => statuses.includes(id))}
              onChange={(_event, selected) => setStatuses(selected.map(({ id }) => id))}
              noOptionsText='Tous les statuts sont sélectionnés'
              renderInput={params => (
                <TextField {...params} name='export-invoice-statuses' placeholder={statuses.length === 0 ? 'Sélectionner un statut' : ''} />
              )}
            />
          </Box>
          <Box className='export-field-group'>
            <Typography className='export-field-label'>État des factures</Typography>
            <RadioGroup
              row
              value={enableStatus}
              name='export-invoice-enable-status'
              onChange={({ target: { value } }) => setEnableStatus(value as EnableStatus)}
            >
              {ENABLE_STATUS_CHOICES.map(({ id, name }) => (
                <FormControlLabel key={id} value={id} label={name} control={<Radio />} />
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} name='export-invoice-cancel'>
          Annuler
        </Button>
        <Button
          variant='contained'
          name='export-invoice-submit'
          disabled={isLoading || !exportFrom || !exportTo || statuses.length === 0}
          onClick={() => onSubmit({ period, from: exportFrom, to: exportTo, statuses, enableStatus })}
        >
          Initier le téléchargement
        </Button>
      </DialogActions>
    </Dialog>
  );
};
