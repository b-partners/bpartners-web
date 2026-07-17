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
    '& > *': {
      flex: 1,
    },
  },
};

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
  const [from, setFrom] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [to, setTo] = useState<Dayjs | null>(dayjs());
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([InvoiceStatus.CONFIRMED]);
  const [enableStatus, setEnableStatus] = useState<EnableStatus>(EnableStatus.ENABLED);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' sx={INVOICE_EXPORT_MODAL_STYLE} {...rest}>
      <DialogTitle>Télécharger les factures</DialogTitle>
      <DialogContent>
        <Box className='export-content'>
          <Box className='export-field-group'>
            <Typography className='export-field-label'>Période de création de la facture</Typography>
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
          disabled={isLoading || !from || !to || statuses.length === 0}
          onClick={() => onSubmit({ from, to, statuses, enableStatus })}
        >
          Initier le téléchargement
        </Button>
      </DialogActions>
    </Dialog>
  );
};
