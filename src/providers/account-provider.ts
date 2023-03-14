import { Account, AccountHolder, BusinessActivity, CompanyBusinessActivity, CompanyInfo, CreateAnnualRevenueTarget, User } from 'bpartners-react-client';

import { userAccountsApi } from './api';
import authProvider from './auth-provider';
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

export const getCachedUser = (): User => JSON.parse(localStorage.getItem(userItem));
export const getCachedAccount = (): Account => JSON.parse(localStorage.getItem(accountItem));

export const getCachedAccountHolder = (): AccountHolder => JSON.parse(localStorage.getItem(accountHolderItem));

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

export const accountHoldersGetter = async (): Promise<AccountHolder> => {
  if (true) {
    // TODO: should be !getCachedAccountHolder(), but we force systematic cach resync for now
    const whoami = authProvider.getCachedWhoami();
    const account = await singleAccountGetter(whoami?.user?.id);
    const { data } = await userAccountsApi().getAccountHolders(whoami?.user?.id, account.id);
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
      accountHolder: await accountHoldersGetter(),
    };
  },
  async saveOrUpdate(resources: CompanyInfo[]): Promise<AccountHolder[]> {
    const user = getCachedUser();
    const account = getCachedAccount();
    const accountHolder = await accountHoldersGetter();
    const { data } = await userAccountsApi().updateCompanyInfo(user?.id, account?.id, accountHolder?.id, resources[0]);
    cacheAccountHolder(data);
    return [data];
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export const businessActivitiesProvider = {
  update: async (resources: CompanyBusinessActivity): Promise<AccountHolder> => {
    const user = getCachedUser();
    const account = getCachedAccount();
    const accountHolder = await accountHoldersGetter();
    const { data } = await userAccountsApi().updateBusinessActivities(user?.id, account?.id, accountHolder?.id, resources);
    cacheAccountHolder(data);
    return data;
  },
  getJobList: async (): Promise<BusinessActivity[]> => {
    return (await userAccountsApi().getBusinessActivities(1, 100)).data;
  },
};

export const revenueTargetsProvider = {
  update: async (resources: CreateAnnualRevenueTarget[]): Promise<AccountHolder> => {
    const user = getCachedUser();
    const account = getCachedAccount();
    const accountHolder = await accountHoldersGetter();
    const { data } = await userAccountsApi().updateRevenueTargets(user?.id, account?.id, accountHolder?.id, resources);
    cacheAccountHolder(data);
    return data;
  },
};

export default accountProvider;
