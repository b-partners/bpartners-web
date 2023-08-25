import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Invoice } from 'bpartners-react-client';
import { FC, ReactNode } from 'react';
import { invoiceGetContext } from '../utils';

type InvoiceModalTitleProps = {
  invoice?: Invoice;
  label: ReactNode;
  title?: string;
  gen?: boolean;
};

export const InvoiceModalTitle: FC<InvoiceModalTitleProps> = ({ invoice = {}, label, title, gen = true }) => {
  return (
    <Box>
      <span style={{ color: grey['500'] }}>
        {label} {gen && `${invoiceGetContext(invoice, 'du', 'de la')} ref:`}
      </span>
      <br /> {title || invoice.ref}
    </Box>
  );
};
