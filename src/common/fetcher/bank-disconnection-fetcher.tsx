import { BankDisconnectionMessage } from '@/operations/bank';
import { bankProvider, cache } from '@/providers';
import { Account } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { addMinutes } from 'date-fns';
import { useNotify } from 'react-admin';
import { useDialog } from '../store/dialog';

export const useBankDisconnectionFetcher = (setAccount: (account: Account) => void) => {
  const notify = useNotify();
  const { close: closeDialog, open: openDialog } = useDialog();
  return useMutation({
    mutationKey: ['bank', 'disconnection'],
    mutationFn: async () => {
      try {
        const newAccount = await bankProvider.endConnection();
        setAccount(newAccount);
        closeDialog();
        notify('messages.disconnection.success', { type: 'success' });
        openDialog(<BankDisconnectionMessage />);
        const dateIn5Minutes = addMinutes(new Date(), 2);
        cache.bankReconnectionTime(dateIn5Minutes.getTime().toString());
      } catch {
        notify('messages.global.error', { type: 'error' });
      }
    },
  });
};
