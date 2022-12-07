import { Account, AccountHolder } from 'src/gen/bpClient';

import { userAccountsApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';

import profileProvider from './profile-provider';

const userItem = 'bp_user';
const accountItem = 'bp_account';
const accountHolderItem = 'bp_accountHolder';

export const cacheUser = (user: any) => {
  localStorage.setItem(userItem, JSON.stringify(user));
  return user;
};

export const cacheAccount = (account: any) => {
  localStorage.setItem(accountItem, JSON.stringify(account));
  return account;
};

export const cacheAccountHolder = (accountHolder: any) => {
  localStorage.setItem(accountHolderItem, JSON.stringify(accountHolder));
  return accountHolder;
};

export const getCachedUser = (): any => JSON.parse(localStorage.getItem(userItem));
export const getCachedAccount = (): any => JSON.parse(localStorage.getItem(accountItem));
export const getCachedAccountHolder = (): any => JSON.parse(localStorage.getItem(accountHolderItem));

export const singleAccountGetter = async (userId: string): Promise<Account> => {
  const hasOnlyOneAccount = (accounts: Account[]) => {
    if (accounts.length > 1) {
      throw new Error("NotImplemented('Only 1 user with only 1 account and only 1 accountHolder is supported')");
    }
  };

  if (!getCachedAccount()) {
    const { data } = await userAccountsApi().getAccountsByUserId(userId);
    hasOnlyOneAccount(data);
    return cacheAccount(data[0]);
  }
  return getCachedAccount();
};

export const accountHoldersGetter = async (userId: string): Promise<AccountHolder> => {
  const account = await singleAccountGetter(userId);
  if (!getCachedAccountHolder()) {
    const { data } = await userAccountsApi().getAccountHolders(userId, account.id);
    cacheAccountHolder(data[0]);
  }
  return getCachedAccountHolder();
};

export const userGetter = async (userId: string) => getCachedUser() || cacheUser(await profileProvider.getOne(userId));

const accountProvider: BpDataProviderType = {
  async getOne(userId: string) {
    return {
      id: userId,
      user: await userGetter(userId),
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
