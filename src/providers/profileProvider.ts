import { usersApi } from './api';
import { HaDataProviderType } from './HaDataProviderType';

const profileProvider: HaDataProviderType = {
  async getOne(id: string) {
    const role = 'MANAGER';
    if (role === 'MANAGER') {
      return usersApi()
        .getManagerById(id)
        .then((result) => result.data);
    }
    throw new Error('Nothing');
  },
  // getList params: (page: number, perPage: number, filter: any)
  getList: (): Promise<any[]> => {
    throw new Error('Function not implemented.');
  },
  // save or update params: (resources: any[])
  saveOrUpdate: (): Promise<any[]> => {
    throw new Error('Function not implemented.');
  },
};

export default profileProvider;
