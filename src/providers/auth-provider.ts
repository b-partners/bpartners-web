import { Configuration, SecurityApi, Whoami } from 'bpartners-react-client';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports';
import loginRedirectionUrls from 'src/security/login-redirection-urls';

Amplify.configure(awsExports);

export const whoamiItem = 'bp_whoami';
export const accessTokenItem = 'bp_access_token';
export const refreshTokenItem = 'bp_refresh_token';
export const unapprovedFiles = 'bp_unapproved_Files';

export const cacheUnapprovedFiles = (onlyNotApprovedLegalFiles: any) => localStorage.setItem(unapprovedFiles, onlyNotApprovedLegalFiles.length);
const getCachedUnapprovedFiles = () => localStorage.getItem(unapprovedFiles);

export const getCachedAccessToken = () => localStorage.getItem(accessTokenItem);

export const whoami = async (): Promise<any> => {
  const session = await Auth.currentSession();

  const conf = new Configuration();
  conf.accessToken = session.getIdToken().getJwtToken();
  cacheTokens(session.getIdToken().getJwtToken(), session.getRefreshToken().getToken());

  const securityApi = new SecurityApi(conf);
  const { data } = await securityApi.whoami();
  return data;
};

const cacheWhoami = (whoami: Whoami): Whoami => {
  localStorage.setItem(whoamiItem, JSON.stringify(whoami));
  return whoami;
};

const cacheTokens = (accessToken: string, refreshToken: string): void => {
  //TODO: localStorage does not work on private browsing
  localStorage.setItem(accessTokenItem, accessToken);

  localStorage.setItem(refreshTokenItem, refreshToken);
};

const getCachedWhoami = (): Whoami => JSON.parse(localStorage.getItem(whoamiItem));

const getCachedAuthConf = (): Configuration => {
  const accessToken = localStorage.getItem(accessTokenItem);
  const conf = new Configuration({ accessToken });
  conf.baseOptions = { headers: { Authorization: `Bearer ${accessToken}` } };
  return conf;
};

const clearCache = () => {
  localStorage.clear();
  sessionStorage.clear();
};

type RaPermission = {
  action: string;
  resource: string;
  record?: any;
};

const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider

  login: async ({ username, password, clientMetadata }: Record<string, any>): Promise<string> => {
    try {
      await Auth.signIn(username as string, password as string);
      const whoamiData = await whoami();
      cacheWhoami(whoamiData);
      return loginRedirectionUrls.successUrl;
    } catch (error) {
      console.log(error);
      return loginRedirectionUrls.failureUrl;
    }
  },

  logout: async (): Promise<void> => {
    await Auth.signOut();
    clearCache();
  },

  checkAuth: async (): Promise<void> => ((await whoami()) ? Promise.resolve() : Promise.reject()),

  checkError: ({ status }: any): Promise<any> => {
    const unapprovedFiles = +getCachedUnapprovedFiles();

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

  getCachedWhoami: getCachedWhoami,
  getCachedAuthConf: getCachedAuthConf,
};

export default authProvider;
