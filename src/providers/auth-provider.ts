import { Configuration, Whoami } from '../gen/bpClient';
import { securityApi } from './api';

const idItem = 'bp_id';
const accessTokenItem = 'bp_access_token';
const refreshTokenItem = 'bp_refresh_token';

const whoami = async (): Promise<Whoami> => {
  const conf = new Configuration();
  conf.accessToken = localStorage.getItem(accessTokenItem) as string;
  return securityApi()
    .whoami()
    .then(({ data }) => data)
    .catch(error => {
      console.error(error);
      return {};
    });
};

const cacheWhoami = (whoami: Whoami): void => {
  sessionStorage.setItem(idItem, whoami.user?.id as string);
};

const cacheTokens = (accessToken: string, refreshToken: string): void => {
  //TODO: localStorage does not work on private browsing
  localStorage.setItem(accessTokenItem, accessToken);
  localStorage.setItem(refreshTokenItem, refreshToken);
};

const getCachedWhoami = () => ({ id: sessionStorage.getItem(idItem) });

const getCachedAuthConf = (): Configuration => {
  const conf = new Configuration();
  conf.accessToken = sessionStorage.getItem(accessTokenItem) as string;
  return conf;
};

const clearCache = () => {
  localStorage.clear();
  sessionStorage.clear();
};

const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider

  login: async ({ username, password, clientMetadata }: Record<string, any>): Promise<void> =>
    securityApi()
      .createToken({
        code: password,
        redirectionStatusUrls: { successUrl: clientMetadata.successUrl, failureUrl: clientMetadata.failureUrl },
      })
      .then(({ accessToken, refreshToken, whoami }) => {
        cacheWhoami(whoami);
        cacheTokens(accessToken, refreshToken);
      }),

  logout: async (): Promise<void> => {
    clearCache();
    //TODO: invalidate token backend side
  },

  checkAuth: async (): Promise<void> => ((await whoami()) ? Promise.resolve() : Promise.reject()),

  checkError: ({ status }: any): Promise<void> => (status === 200 ? Promise.resolve() : Promise.reject()),

  getIdentity: async () => (await whoami()).user?.id,

  getPermissions: async (): Promise<Array<string>> => Promise.resolve(['*']),

  // --------------------- non-ra functions ----------------------------------------

  getCachedWhoami: getCachedWhoami,
  getCachedAuthConf: getCachedAuthConf,
};

export default authProvider;
