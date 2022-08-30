import { HaDataProviderType } from './ha-data-provider-type'
import httpClient from 'src/config/http-client'

const profileProvider: HaDataProviderType = {
  async getOne(id: string) {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      return
    }
    try {
      const { data } = await httpClient.get('whoami', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      localStorage.setItem('userId', data.user.id || '')
      return data.user
    } catch {
      throw new Error('Bad url')
    }
  },
  getList: function(page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.')
  },
  saveOrUpdate: function(resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.')
  }
}

export default profileProvider
