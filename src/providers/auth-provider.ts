import { Configuration } from '../gen/haClient'
import getParams from '../operations/utils/getParams'
import { Promise } from 'q'
import httpClient from '../config/http-client'
import axios from 'axios'

// const idItem = 'ha_id'
// const roleItem = 'ha_role'
const bearerItem = 'ha_bearer'
const paramIsTemporaryPassword = 't'
// const paramUsername = 'u'
// const paramTemporaryPassword = 'p'

// const toBase64 = (param: string) => Buffer.from(param).toString('base64')

// const fromBase64 = (param: string) => Buffer.from(param, 'base64').toString('ascii')

const getCachedAuthConf = (): Configuration => {
  const conf = new Configuration()
  conf.accessToken = sessionStorage.getItem(bearerItem) as string
  return conf
}

const authProvider = {
  // --------------------- ra functions -------------------------------------------
  // https://marmelab.com/react-admin/Authentication.html#anatomy-of-an-authprovider
  login: () => {
    return Promise(async (resolve, reject) => {
      const { search } = document.location
      const code = getParams(search, 'code')
      if (!code) {
        reject('Code not provided')
      }
      try {
        const { data: { accessToken, refreshToken } } = await httpClient.post('token', {
          code,
          successUrl: process.env.REACT_APP_SUCCESS_URL,
          failureUrl: process.env.REACT_APP_FAILURE_URL
        })
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },

  logout: async () => Promise((resolve, reject) => {
    localStorage.clear()
    resolve()
  }),

  checkAuth: async () => {
    return Promise((resolve, reject) => {
      if (localStorage.get('accessToken')) {
        resolve()
      }
      reject()
    })
  },

  checkError: (error: any) => Promise((resolve, reject) => {
    const { status } = error
    if (status === 401 || status === 403) {
      localStorage.clear()
      reject()
    }
    resolve()
  }),

  getIdentity: async () => Promise(async (resolve, reject) => {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        reject()
      }
      try {
        const { data: { user } } = await httpClient.get('whoami', { headers: { Authorization: `Bearer ${accessToken}` } })
        localStorage.setItem('user', JSON.stringify(user))
      } catch (e) {
        reject(e)
      }
    }
  ),

  getPermissions: async () => Promise((resolve, reject) => resolve([]))

}
export default authProvider
