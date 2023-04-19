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

const paramIsTemporaryPassword = 't';
const paramUsername = 'u';
const paramTemporaryPassword = 'p';

const toBase64 = (param: string) => Buffer.from(param).toString('base64');
const fromBase64 = (param: string) => Buffer.from(param, 'base64').toString('ascii');

const authProvider = {
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
      const whoamiData = await whoami();
      cacheWhoami(whoamiData);
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
  isTemporaryPassword: (): boolean => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(paramIsTemporaryPassword) === 'true';
  },
  setNewPassword: async (newPassword: string): Promise<void> => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = fromBase64(decodeURIComponent(urlParams.get(paramUsername) as string)) as string;
    const temporaryPassword = fromBase64(decodeURIComponent(urlParams.get(paramTemporaryPassword) as string)) as string;
    const user = await Auth.signIn(username, temporaryPassword);
    await Auth.completeNewPassword(user, newPassword, { phone_number: '+33648492113' /*TODO*/ });
    window.location.replace('/');
  },
};

export default authProvider;
