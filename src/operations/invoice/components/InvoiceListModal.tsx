/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC, ReactNode } from 'react';
import { ModalType, useInvoiceToolContext } from 'src/common/store/invoice';

type InvoiceListModalProps = {
  type: ModalType;
  title: ReactNode;
  actions?: ReactNode;
};

export const InvoiceListModal: FC<InvoiceListModalProps> = ({ type, children, title, actions }) => {
  const {
    closeModal,
    modal: { isOpen, type: modalType },
  } = useInvoiceToolContext();

  return (
    modalType === type && (
      <Dialog open={isOpen} onClose={closeModal} maxWidth='lg'>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: '50vw', minHeight: '40vh', maxHeight: '60vh' }}>{children}</Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', mr: 2, alignItems: 'center', position: 'relative' }}>
          <Button onClick={closeModal} name='invoice-list-modal-cancel-button'>
            Annuler
          </Button>
          {actions}
        </DialogActions>
      </Dialog>
    )
  );
};
