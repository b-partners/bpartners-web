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
        <BPButton label='bp.action.disconnect' isLoading={isPending} onClick={() => disconnectBank()} data-testid='bank-disconnection-button' />
        <BPButton label='ra.action.cancel' isLoading={isPending} onClick={closeDialog} />
      </DialogActions>
    </>
  );
};

export const BankDisconnectionMessage = () => {
  const { close: closeDialog } = useDialog();

  return (
    <>
      <DialogTitle id='alert-dialog-title'>Confirmation</DialogTitle>
      <DialogContent sx={{ width: 500 }}>
        <DialogContentText>La déconnexion de votre banque est en cours. Veuillez attendre 5min avant de reconnecter une nouvelle banque</DialogContentText>
      </DialogContent>
      <DialogActions>
        <BPButton label='Fermer' onClick={closeDialog} />
      </DialogActions>
    </>
  );
};
