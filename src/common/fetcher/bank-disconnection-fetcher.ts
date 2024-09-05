import { bankProvider } from '@/providers';
import { Account } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { useDialog } from '../store/dialog';

export const useBankDisconnectionFetcher = (setAccount: (account: Account) => void) => {
  const notify = useNotify();
  const { close: closeDialog } = useDialog();
  return useMutation({
    mutationKey: ['bank', 'disconnection'],
    mutationFn: async () => {
      try {
        const newAccount = await bankProvider.endConnection();
        setAccount(newAccount);
        closeDialog();
        notify('messages.disconnection.success', { type: 'success' });
      } catch {
        notify('messages.global.error', { type: 'error' });
      }
    },
  });
};
