import { InvoiceStatus } from 'bpartners-react-client';
import { FC } from 'react';
import { InvoiceToolState } from 'src/common/store/invoice';
import { InvoiceTabPanel } from './InvoiceTabPanel';
import { FormGroup, FormControlLabel, Switch, Button } from '@mui/material';
import { useConfirmedInvoiceToShow } from '../utils';
import { EMPTY_BUTTON_STYLE } from './EmptyInvoiceList';

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
        <FormGroup>
          <FormControlLabel
            control={<Switch data-testid='invoice-confirmed-switch' checked={switchValue} onClick={toggleConfirmedInvoiceToShow} />}
            label='Impayées uniquement'
          />
        </FormGroup>
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
