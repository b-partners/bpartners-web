import { HaDataProviderType } from './ha-data-provider-type';
import httpClient from 'src/config/http-client';

const profileProvider: HaDataProviderType = {
  async getOne(id: string) {
    try {
      const { data } = await httpClient.get('whoami', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken") || ''}`
        }
      });
      console.log(data)
      localStorage.setItem("userId", data.user.id || '');
      return data.user;
    } catch {
      throw new Error('Bad url');
    }
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  }
};

export default profileProvider;
