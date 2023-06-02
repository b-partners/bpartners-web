import { Account, AccountValidationRedirection, UpdateAccountIdentity } from 'bpartners-react-client';
import { getCurrentAccount } from 'src/common/utils';
import loginRedirectionUrls from 'src/security/login-redirection-urls';
import { BpDataProviderType, accountHolderProvider, cache, getCached, onboardingApi, userAccountsApi, whoami } from '.';

export const accountProvider: BpDataProviderType = {
  async getOne(_userId?: string) {
    // TODO: return the account with the attribut current = true but wait for the backend to implement it
    const { userId } = getCached.userInfo();
    const { data } = await userAccountsApi().getAccountsByUserId(_userId || userId);
    const account: Account = getCurrentAccount(data);
    return cache.account(account);
  },
  async saveOrUpdate(resources: any) {
    throw new Error('Function not implemented.');
  },
  async getList(page: number, perPage: number, filter: any) {
    const { userId } = getCached.userInfo();
    const { data } = await userAccountsApi().getAccountsByUserId(userId);
    return data;
  },
  async updateOne(resource: UpdateAccountIdentity) {
    const { userId, accountId } = getCached.userInfo();
    const {
      data: { name, iban, bic },
    } = await userAccountsApi().updateAccountIdentity(userId, accountId, resource);
    return cache.account({ ...getCached.account(), name, iban, bic });
  },
};

export const initiateAccountValidation = async (): Promise<AccountValidationRedirection> => {
  const { userId, accountId } = getCached.userInfo();
  const { data } = await userAccountsApi().initiateAccountValidation(userId, accountId, loginRedirectionUrls);
  return data;
};

export const onboarding = async (resources: any[]) => await onboardingApi().onboardUsers(resources);

export const getAccountLogoUrl = () => {
  const { accessToken } = getCached.token();
  const { accountId } = getCached.userInfo();
  const {
    user: { logoFileId },
  } = getCached.whoami();
  return logoFileId
    ? `${process.env.REACT_APP_BPARTNERS_API_URL}/accounts/${accountId}/files/${logoFileId}/raw?accessToken=${accessToken}&fileType=LOGO`
    : null;
};

export const setCurrentAccount = async (accountId: string) => {
  const { id: userId } = getCached.user();
  const { data: user } = await userAccountsApi().setActiveAccount(userId, accountId);
  cache.user(user);
  cache.account(user.activeAccount);
  cache.whoami({ user });
  await accountHolderProvider.getOne();
};
