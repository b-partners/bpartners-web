import { BPButton } from '@/common/components';
import { useBankDisconnectionFetcher } from '@/common/fetcher';
import { useDialog } from '@/common/store/dialog';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FC } from 'react';
import { BankDisconnectionProps } from './types';

export const BankDisconnection: FC<BankDisconnectionProps> = ({ bank, setAccount }) => {
  const { mutate: disconnectBank, isPending } = useBankDisconnectionFetcher(setAccount);
  const { close: closeDialog } = useDialog();

  return (
    <>
      <DialogTitle id='alert-dialog-title'>Confirmation</DialogTitle>
      <DialogContent sx={{ width: 500 }}>
        <DialogContentText>
          Voulez vous déconnecter la banque <b>{bank.name}</b> ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <BPButton label='Déconnecter' isLoading={isPending} onClick={() => disconnectBank()} data-testid='bank-disconnection-button' />
        <BPButton label='Annuler' isLoading={isPending} onClick={closeDialog} />
      </DialogActions>
    </>
  );
};
