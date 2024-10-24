import loginRedirectionUrls from '@/security/login-redirection-urls';
import { Configuration, SecurityApi } from '@bpartners/typescript-client';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { accountHolderProvider } from './account-holder-Provider';
import { accountProvider } from './account-provider';
import { awsAuth, awsConfig } from './aws-config';
import { cache, clearCache, getCached } from './cache';
import { profileProvider } from './profile-provider';

Amplify.configure(awsConfig, { ssr: true });

const cacheAccounts = async () => {
  // if there is not account or account holder in the local storage,
  // this function will refetch them otherwise it do nothing
  await accountProvider.getOne();
  await accountHolderProvider.getOne();
  await profileProvider.getOne(getCached.whoami().user.id);
};

export const whoami = async (): Promise<any> => {
  const session = (await awsAuth.fetchAuthSession()) || {};
  const conf = new Configuration();
  const accessToken = session.tokens?.idToken?.toString();

  conf.accessToken = accessToken;
  if (!accessToken) {
    return null;
  }
  cache.token(accessToken, session.tokens?.accessToken.toString());
  if (getCached.whoami() && getCached.user()) {
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

const toBase64 = (param: string) => btoa(param);
const fromBase64 = (param: string) => atob(param);

export const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider

  login: async ({ username, password, clientMetadata }: Record<string, any>): Promise<string> => {
    try {
      const user = await awsAuth.signIn({
        username: username as string,
        password: password as string,
        options: {
          clientMetadata: clientMetadata as any,
        },
      });

      console.log(user);

      if (user.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        const encodedUsername = encodeURIComponent(toBase64(username));
        const encodedPassword = encodeURIComponent(toBase64(password));
        return `/login?${paramIsTemporaryPassword}=true&${paramUsername}=${encodedUsername}&${paramTemporaryPassword}=${encodedPassword}`;
      }
      await whoami();
      return loginRedirectionUrls.successUrl;
    } catch (error) {
      console.log(error);

      return loginRedirectionUrls.failureUrl;
    }
  },

  logout: async (): Promise<void> => {
    await awsAuth.signOut();
    clearCache();
  },

  checkAuth: async (): Promise<void> => ((await whoami()) ? Promise.resolve() : Promise.reject({ message: false })),

  checkError: ({ status }: any): Promise<any> => {
    const unapprovedFiles = getCached.unapprovedFiles();

    if ((status === 401 || status === 403) && (!unapprovedFiles || unapprovedFiles === 0)) {
      return Promise.reject({ message: false });
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
  setNewPassword: async (newPassword: string, _phoneNumber: string): Promise<void> => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = fromBase64(decodeURIComponent(urlParams.get(paramUsername)));
    const oldPassword = fromBase64(decodeURIComponent(urlParams.get(paramTemporaryPassword)));
    await awsAuth.signIn({ username, password: oldPassword });

    await awsAuth.updatePassword({ newPassword, oldPassword });
    window.location.replace('/');
  },
};
