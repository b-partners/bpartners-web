/* eslint-disable react-hooks/exhaustive-deps */
import { ModalType, useInvoiceToolContext } from '@/common/store/invoice';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC, ReactNode } from 'react';

type InvoiceListModalProps = {
  type: ModalType;
  title: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
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
        <DialogContent sx={{ overflow: 'hidden' }}>
          <Box sx={{ minWidth: '50vw', minHeight: '40vh', maxHeight: '60vh', overflow: 'hidden' }}>{children}</Box>
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
