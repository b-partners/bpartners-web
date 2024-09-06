import { BankDisconnectionMessage } from '@/operations/bank';
import { bankProvider, cache } from '@/providers';
import { Account } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { addMinutes } from 'date-fns';
import { useNotify } from 'react-admin';
import { useBankDisconnection } from '../store';
import { useDialog } from '../store/dialog';

const TWO_MINUTES_TO_WAIT = 5;

export const useBankDisconnectionFetcher = (setAccount: (account: Account) => void) => {
  const notify = useNotify();
  const { close: closeDialog, open: openDialog } = useDialog();
  const { setIsInDisconnection } = useBankDisconnection();
  return useMutation({
    mutationKey: ['bank', 'disconnection'],
    mutationFn: async () => {
      try {
        const newAccount = await bankProvider.endConnection();
        setAccount(newAccount);
        closeDialog();
        notify('messages.disconnection.success', { type: 'success' });
        openDialog(<BankDisconnectionMessage />);
        const dateIn2Minutes = addMinutes(new Date(), TWO_MINUTES_TO_WAIT);
        cache.bankReconnectionTime(dateIn2Minutes.getTime().toString());
        setIsInDisconnection(true);
      } catch {
        notify('messages.global.error', { type: 'error' });
      }
    },
  });
};
