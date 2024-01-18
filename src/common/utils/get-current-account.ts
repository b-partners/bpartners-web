import { Account } from '@bpartners/typescript-client';

export const getCurrentAccount = (accounts: Account[]) => {
  const currentAccount = accounts?.filter(account => account.active);
  // TODO: ui interface if there is no selected account
  return currentAccount.length === 0 ? accounts[0] : currentAccount[0];
};
