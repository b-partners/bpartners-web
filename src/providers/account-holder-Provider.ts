import {
  AccountHolder,
  AccountHolderFeedback,
  BusinessActivity,
  CompanyBusinessActivity,
  CompanyInfo,
  EmailRecipientsConfiguration,
  UpdateAccountHolder,
} from '@bpartners/typescript-client';
import { asyncGetAccountId, asyncGetUser, BpDataProviderType, cache, getCached, userAccountsApi } from '.';

export const accountHolderProvider: BpDataProviderType = {
  async getOne() {
    const { userId } = getCached.userInfo();
    const aId = await asyncGetAccountId();
    const { data } = await userAccountsApi().getAccountHolders(userId, aId);
    const user = await asyncGetUser();
    return { ...cache.accountHolder(data[0]), id: undefined, user };
  },
  async saveOrUpdate(resources: CompanyInfo[]): Promise<AccountHolder[]> {
    const { accountHolderId, accountId, userId } = getCached.userInfo();
    const { data } = await userAccountsApi().updateCompanyInfo(userId, accountId, accountHolderId, { ...resources[0] });
    return [cache.accountHolder(data)];
  },
  getList: async (_page: number, _perPage: number, filter: any) => {
    const { name } = filter;
    const { data } = await userAccountsApi().getAllAccountHolders(name);
    return data;
  },
};

export const businessActivitiesProvider = {
  update: async (resources: CompanyBusinessActivity): Promise<AccountHolder> => {
    const { accountHolderId, accountId, userId } = getCached.userInfo();
    const { data } = await userAccountsApi().updateBusinessActivities(userId, accountId, accountHolderId, resources);
    return cache.accountHolder(data);
  },
  getJobList: async (): Promise<BusinessActivity[]> => {
    return (await userAccountsApi().getBusinessActivities(1, 100)).data;
  },
};

export const updateGlobalInformation = async (resources: UpdateAccountHolder): Promise<AccountHolder> => {
  const { userId, accountId, accountHolderId } = getCached.userInfo();
  const { data } = await userAccountsApi().updateAccountHolderInfo(userId, accountId, accountHolderId, resources);
  return cache.accountHolder(data);
};

export const updateCompanyInfo = async (resources: CompanyInfo[]) => {
  const { accountHolderId, accountId, userId } = getCached.userInfo();
  const { data } = await userAccountsApi().updateCompanyInfo(userId, accountId, accountHolderId, resources[0]);
  return [cache.accountHolder(data)];
};

export const updateFeedbackLink = async (feedbackLink: string) => {
  const { accountHolderId, userId } = getCached.userInfo();
  const feedback: AccountHolderFeedback = { feedbackLink };

  const { data: accountHolder } = await userAccountsApi().updateFeedbackConf(userId, accountHolderId, feedback);
  return cache.accountHolder(accountHolder);
};

export const getEmailRecipients = async (): Promise<EmailRecipientsConfiguration> => {
  const { accountHolderId, userId } = getCached.userInfo();
  const { data } = await userAccountsApi().getEmailRecipients(userId, accountHolderId);
  return data;
};

export const configureEmailRecipients = async (configuration: EmailRecipientsConfiguration): Promise<EmailRecipientsConfiguration> => {
  const { accountHolderId, userId } = getCached.userInfo();
  const { data } = await userAccountsApi().configureEmailRecipients(userId, accountHolderId, configuration);
  return data;
};
