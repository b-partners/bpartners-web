import { BpDataProviderType } from './bp-data-provider-type';

import profileProvider from './profile-provider';

const accountProvider: BpDataProviderType = {
  async getOne(userId: /*TODO*/ string) {
    const testLogo1 = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Wikimedia-logo.png'; //TODO
    return profileProvider.getOne(userId).then(user => ({
      id: userId, //TODO
      user: user,
      accountHolder: { name: 'Numer', siren: '1234543', address: '6 rue Paul Langevin', logo: testLogo1 },
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
