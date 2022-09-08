import { Account } from 'src/gen/bpClient';

export const verifyAccountsNumber = (accounts: Account[]) => {
  if (accounts.length > 1) {
    throw new Error("NotImplemented('Only 1 user with only 1 account and only 1 accountHolder is supported')");
  }
};
