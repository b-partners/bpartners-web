import { InvoiceToolState } from '@/common/store/invoice';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { Button, Stack, Switch, Typography } from '@mui/material';
import { FC } from 'react';
import { useConfirmedInvoiceToShow } from '../utils';
import { EMPTY_BUTTON_STYLE } from './EmptyInvoiceList';
import { InvoiceTabPanel } from './InvoiceTabPanel';

type InvoiceConfirmedPayedTabPanelProps = {
  index: InvoiceToolState['tab'];
  onStateChange: any;
  type: InvoiceStatus[];
};

export const InvoiceConfirmedPayedTabPanel: FC<InvoiceConfirmedPayedTabPanelProps> = ({ index, onStateChange }) => {
  const { current: confirmedInvoiceToShow, toggleConfirmedInvoiceToShow, switchValue } = useConfirmedInvoiceToShow();

  return (
    <InvoiceTabPanel
      index={index}
      onStateChange={onStateChange}
      actions={
        <Stack direction='row' spacing={1} alignItems='center'>
          <Typography>Tout voir</Typography>
          <Switch data-testid='invoice-confirmed-switch' checked={switchValue} onClick={toggleConfirmedInvoiceToShow} />
          <Typography>À payer uniquement</Typography>
        </Stack>
      }
      emptyAction={
        confirmedInvoiceToShow.length === 1 && (
          <Button name='create-confirmed-invoice' sx={EMPTY_BUTTON_STYLE} onClick={toggleConfirmedInvoiceToShow}>
            Voir tout
          </Button>
        )
      }
      type={confirmedInvoiceToShow as any}
    />
  );
};
