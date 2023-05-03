import { Account, AccountValidationRedirection, UpdateAccountIdentity } from 'bpartners-react-client';
import loginRedirectionUrls from 'src/security/login-redirection-urls';
import { BpDataProviderType, cache, getCached, onboardingApi, userAccountsApi } from '.';

export const accountProvider: BpDataProviderType = {
  async getOne(_userId?: string) {
    // TODO: return the account with the attribut current = true but wait for the backend to implement it
    const { userId } = getCached.userInfo();
    const { data } = await userAccountsApi().getAccountsByUserId(_userId || userId);
    const account: Account = data[0];
    return cache.account(account);
  },
  async saveOrUpdate(resources: any) {
    throw new Error('Function not implemented.');
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
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
