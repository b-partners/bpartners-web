import { Configuration, Whoami } from '../gen/bpClient'
import { securityApi } from './api'

const whoamiItem = 'bp_whoami'
const accessTokenItem = 'bp_access_token'
const refreshTokenItem = 'bp_refresh_token'

const whoami = async (): Promise<Whoami> => {
  return securityApi()
    .whoami()
    .then(({ data }) => data)
}

const cacheWhoami = (whoami: Whoami): Whoami => {
  localStorage.setItem(whoamiItem, JSON.stringify(whoami))
  return whoami
}

const cacheTokens = (accessToken: string, refreshToken: string): void => {
  //TODO: localStorage does not work on private browsing
  localStorage.setItem(accessTokenItem, accessToken)

  localStorage.setItem(refreshTokenItem, refreshToken)
}

const getCachedWhoami = (): Whoami => JSON.parse(localStorage.getItem(whoamiItem))

const getCachedAuthConf = (): Configuration => {
  const accessToken = localStorage.getItem(accessTokenItem)
  const conf = new Configuration({ accessToken })
  conf.baseOptions = { headers: { Authorization: `Bearer ${accessToken}` } }
  return conf
}

const clearCache = () => {
  localStorage.clear()
  sessionStorage.clear()
}

type RaPermission = {
  action: string;
  resource: string;
  record?: any;
};

const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider

  login: async ({ username, password, clientMetadata }: Record<string, any>): Promise<void> =>
    securityApi()
      .createToken({
        code: password,
        redirectionStatusUrls: clientMetadata == null ? null : clientMetadata.redirectionStatusUrls
      })
      .then(({ data: { accessToken, refreshToken, whoami } }) => {
        cacheTokens(accessToken, refreshToken)
        cacheWhoami(whoami)
      }),

  logout: async (): Promise<void> => {
    clearCache()
    //TODO: invalidate token backend side
  },

  checkAuth: async (): Promise<void> => ((await whoami()) ? Promise.resolve() : Promise.reject()),

  checkError: ({ status }: any): Promise<void> => (status === 200 ? Promise.resolve() : Promise.reject()),

  getIdentity: async () => (await whoami()).user?.id,

  getPermissions: async (): Promise<Array<RaPermission>> => Promise.resolve([{ action: '*', resource: '*' }]),

  // --------------------- non-ra functions ----------------------------------------

  getCachedWhoami: getCachedWhoami,
  getCachedAuthConf: getCachedAuthConf
}

export default authProvider
