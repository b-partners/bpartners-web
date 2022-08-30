import getParams from '../operations/utils/getParams'
import { Promise } from 'q'
import httpClient from '../config/http-client'

const authProvider = {
  login: () => {
    return Promise(async (resolve, reject) => {
      const { search } = document.location
      const code = getParams(search, 'code')
      if (!code) {
        reject('Code not provided')
        return
      }
      try {
        // const { data } = await httpClient.post('token', {
        //   code,
        //   successUrl: process.env.REACT_APP_SUCCESS_URL,
        //   failureUrl: process.env.REACT_APP_FAILURE_URL
        // })
        // localStorage.setItem('accessToken', data.accessToken)
        // localStorage.setItem('refreshToken', data.refreshToken)
        resolve()
        return
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
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        resolve(accessToken)
      }
      reject('Access token not found')
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
