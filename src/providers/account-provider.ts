import {
  Account,
  AccountHolder,
  BankConnectionRedirection,
  BusinessActivity,
  CompanyBusinessActivity,
  CompanyInfo,
  CreateAnnualRevenueTarget,
  UpdateAccountHolder,
  UpdateAccountIdentity,
  User,
} from 'bpartners-react-client';

import { userAccountsApi } from './api';
import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';

import profileProvider from './profile-provider';
import { createRedirectionUrl } from 'src/common/utils/createRedirectionUrl';
import { getUserInfo } from './utils';

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

export const clearCachedAccount = () => localStorage.removeItem(accountItem);

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
    const { accountHId, accountId, userId } = await getUserInfo();
    const { data } = await userAccountsApi().updateCompanyInfo(userId, accountId, accountHId, resources[0]);
    cacheAccountHolder(data);
    return [data];
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export const businessActivitiesProvider = {
  update: async (resources: CompanyBusinessActivity): Promise<AccountHolder> => {
    const { accountHId, accountId, userId } = await getUserInfo();
    const { data } = await userAccountsApi().updateBusinessActivities(userId, accountId, accountHId, resources);
    cacheAccountHolder(data);
    return data;
  },
  getJobList: async (): Promise<BusinessActivity[]> => {
    return (await userAccountsApi().getBusinessActivities(1, 100)).data;
  },
};

export const revenueTargetsProvider = {
  update: async (resources: CreateAnnualRevenueTarget[]): Promise<AccountHolder> => {
    const { accountHId, accountId, userId } = await getUserInfo();
    const { data } = await userAccountsApi().updateRevenueTargets(userId, accountId, accountHId, resources);
    cacheAccountHolder(data);
    return data;
  },
};

export const updateGlobalInformation = async (resources: UpdateAccountHolder): Promise<AccountHolder> => {
  const { userId, accountId, accountHId } = await getUserInfo();
  const { data } = await userAccountsApi().updateAccountHolderInfo(userId, accountId, accountHId, resources);
  cacheAccountHolder(data);
  return data;
};

export const initiateBankConnection = async (): Promise<BankConnectionRedirection> => {
  const { userId, accountId } = await getUserInfo();
  const redirectionUrl = createRedirectionUrl('/bank', '/error');
  const { data } = await userAccountsApi().initiateBankConnection(userId, accountId, redirectionUrl);
  clearCachedAccount();
  return data;
};

export const updateBankInformation = async (resource: UpdateAccountIdentity) => {
  const { userId, accountId } = await getUserInfo();
  await userAccountsApi().updateAccountIdentity(userId, accountId, resource);
  const { data } = await userAccountsApi().getAccountsByUserId(userId);
  cacheAccount(data[0]);
  return data[0];
};

export default accountProvider;
