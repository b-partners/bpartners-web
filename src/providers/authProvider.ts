import { Configuration } from '../gen/haClient'

const idItem = 'ha_id'
const roleItem = 'ha_role'
const bearerItem = 'ha_bearer'
const paramIsTemporaryPassword = 't'
const paramUsername = 'u'
const paramTemporaryPassword = 'p'

const toBase64 = (param: string) => Buffer.from(param).toString('base64')

const fromBase64 = (param: string) => Buffer.from(param, 'base64').toString('ascii')

const getCachedAuthConf = (): Configuration => {
  const conf = new Configuration()
  conf.accessToken = sessionStorage.getItem(bearerItem) as string
  return conf
}

const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider

  login: async (): Promise<void> => {
  },

  logout: async (): Promise<void> => {
  },

  checkAuth: async (): Promise<void> => {
  },

  checkError: async () => Promise.resolve(),

  getIdentity: async () => {},

  getPermissions: async () => Promise.resolve([]),

  // --------------------- non-ra functions ----------------------------------------

  isTemporaryPassword: (): boolean => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    return urlParams.get(paramIsTemporaryPassword) === 'true'
  },

  setNewPassword: async (newPassword: string): Promise<void> => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const username = fromBase64(decodeURIComponent(urlParams.get(paramUsername) as string)) as string
    const temporaryPassword = fromBase64(decodeURIComponent(urlParams.get(paramTemporaryPassword) as string)) as string
    window.location.replace('/')
  },

  getCachedAuthConf: getCachedAuthConf
}

export default authProvider
