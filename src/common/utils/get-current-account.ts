import { Account } from '@bpartners/typescript-client';

export const getCurrentAccount = (accounts: Account[]) => {
  const currentAccount = accounts?.filter(account => account.active);
  return currentAccount.length === 0 ? accounts[0] : currentAccount[0];
};
