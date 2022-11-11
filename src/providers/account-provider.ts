import { Account, AccountHolder } from 'src/gen/bpClient';

import { userAccountsApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';

import profileProvider from './profile-provider';

export const singleAccountGetter = async (userId: string): Promise<Account> => {
  const hasOnlyOneAccount = (accounts: Account[]) => {
    if (accounts.length > 1) {
      throw new Error("NotImplemented('Only 1 user with only 1 account and only 1 accountHolder is supported')");
    }
  };

  return userAccountsApi()
    .getAccountsByUserId(userId)
    .then(({ data }) => {
      hasOnlyOneAccount(data);
      return data[0];
    });
};

export const accountHoldersGetter = async (userId: string): Promise<AccountHolder> => {
  return singleAccountGetter(userId)
    .then(account => userAccountsApi().getAccountHolders(userId, account.id))
    .then(accountHolders => accountHolders.data[0]);
};

const accountProvider: BpDataProviderType = {
  async getOne(userId: string) {
    return {
      id: userId,
      user: await profileProvider.getOne(userId),
      accountHolder: await accountHoldersGetter(userId),
    };
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default accountProvider;
