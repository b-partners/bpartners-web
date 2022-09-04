import { BpDataProviderType } from './bp-data-provider-type';

import profileProvider from './profile-provider';

const accountProvider: BpDataProviderType = {
  async getOne(userId: /*TODO*/ string) {
    return profileProvider.getOne(userId).then(user => ({
      id: userId, //TODO
      user: user,
      accountHolder: { name: 'Numer', siren: '1234543', address: '6 rue Paul Langevin' }, //TODO
    }));
  },
  getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export default accountProvider;
