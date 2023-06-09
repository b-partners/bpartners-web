import { Amplify, Auth } from 'aws-amplify';
import { Configuration, SecurityApi } from 'bpartners-react-client';
import loginRedirectionUrls from 'src/security/login-redirection-urls';
import awsExports from '../aws-exports';
import { cache, clearCache, getCached } from './cache';
import { accountProvider } from './account-provider';
import { accountHolderProvider } from './account-holder-Provider';
import { profileProvider } from './profile-provider';
Amplify.configure(awsExports);

const cacheAccounts = async () => {
  // is there is not account or account holder in the local storage,
  // this function will refetch them otherwise it do nothing
  await accountProvider.getOne();
  await accountHolderProvider.getOne();
  await profileProvider.getOne(getCached.whoami().user.id);
};

export const whoami = async (): Promise<any> => {
  const session = await Auth.currentSession();

  const conf = new Configuration();
  conf.accessToken = session.getIdToken().getJwtToken();
  if (!session.getIdToken().getJwtToken()) {
    return null;
  }
  cache.token(session.getIdToken().getJwtToken(), session.getRefreshToken().getToken());
  if (getCached.whoami()) {
    return getCached.whoami();
  }
  const securityApi = new SecurityApi(conf);
  const { data } = await securityApi.whoami();
  cache.whoami(data);
  await cacheAccounts();
  return data;
};

type RaPermission = {
  action: string;
  resource: string;
  record?: any;
};

const paramIsTemporaryPassword = 't';
const paramUsername = 'u';
const paramTemporaryPassword = 'p';

const toBase64 = (param: string) => Buffer.from(param).toString('base64');
const fromBase64 = (param: string) => Buffer.from(param, 'base64').toString('ascii');

export const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider

  login: async ({ username, password, clientMetadata }: Record<string, any>): Promise<string> => {
    try {
      const user = await Auth.signIn(username as string, password as string);
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        const encodedUsername = encodeURIComponent(toBase64(username as string));
        const encodedPassword = encodeURIComponent(toBase64(password as string));
        return `/login?${paramIsTemporaryPassword}=true&${paramUsername}=${encodedUsername}&${paramTemporaryPassword}=${encodedPassword}`;
      }
      await whoami();
      return loginRedirectionUrls.successUrl;
    } catch (error) {
      return loginRedirectionUrls.failureUrl;
    }
  },

  logout: async (): Promise<void> => {
    await Auth.signOut();
    clearCache();
  },

  checkAuth: async (): Promise<void> => ((await whoami()) ? Promise.resolve() : Promise.reject()),

  checkError: ({ status }: any): Promise<any> => {
    const unapprovedFiles = getCached.unapprovedFiles();

    if ((status === 401 || status === 403) && (!unapprovedFiles || unapprovedFiles === 0)) {
      return Promise.reject();
    } else if (status === 200) {
      return Promise.resolve();
    }
    return Promise.reject({ message: false, logoutUser: false, redirectTo: window.location.pathname });
  },

  getIdentity: async () => (await whoami()).user?.id,

  getPermissions: async (): Promise<Array<RaPermission>> => Promise.resolve([{ action: '*', resource: '*' }]),

  // --------------------- non-ra functions ----------------------------------------

  getCachedWhoami: getCached.whoami,
  getCachedAuthConf: () => {
    const { accessToken } = getCached.token();
    const conf = new Configuration({ accessToken });
    conf.baseOptions = { headers: { Authorization: `Bearer ${accessToken}` } };
    return conf;
  },
  isTemporaryPassword: (): boolean => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(paramIsTemporaryPassword) === 'true';
  },
  setNewPassword: async (newPassword: string, phoneNumber: string): Promise<void> => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = fromBase64(decodeURIComponent(urlParams.get(paramUsername) as string)) as string;
    const temporaryPassword = fromBase64(decodeURIComponent(urlParams.get(paramTemporaryPassword) as string)) as string;
    const user = await Auth.signIn(username, temporaryPassword);
    await Auth.completeNewPassword(user, newPassword, { phone_number: phoneNumber });
    window.location.replace('/');
  },
};
