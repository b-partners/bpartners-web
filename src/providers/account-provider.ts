import { Account, AccountHolder } from 'src/gen/bpClient';

import { verifyAccountsNumber } from 'src/utils/verifyAccountsNumber';

import { userAccountsApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';

import profileProvider from './profile-provider';

const accountGetter = async (userId: string): Promise<Account[]> => {
  return userAccountsApi()
    .getAccountsByUserId(userId)
    .then(accounts => accounts.data);
};

const accountHoldersGetter = async (userId: string): Promise<AccountHolder> => {
  return accountGetter(userId)
    .then(accounts => {
      verifyAccountsNumber(accounts);
      return userAccountsApi().getAccountHolders(userId, accounts[0].id);
    })
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
