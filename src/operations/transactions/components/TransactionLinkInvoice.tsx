import { useDialog } from '@/common/store/dialog';
import { AddLink as AddLinkIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { FC, MouseEventHandler } from 'react';
import { SelectionDialog } from './SelectionDialog';
import { TransactionLinkInvoiceProps } from './types';

export const TransactionLinkInvoice: FC<TransactionLinkInvoiceProps> = props => {
  const { transaction } = props;
  const { open: openDialog } = useDialog();

  const toggleDialog: MouseEventHandler<HTMLButtonElement> = e => {
    e?.stopPropagation();
    openDialog(<SelectionDialog transaction={transaction} />, { sx: { height: '80vh', minHeight: '80vh' }, fullWidth: true, maxWidth: 'md' });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Tooltip title='Lier à une facture'>
        <IconButton data-testid={`${transaction.id}-link-invoice-button`} onClick={toggleDialog}>
          <AddLinkIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
