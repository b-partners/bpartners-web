import { Account, AccountHolder } from 'src/gen/bpClient';

export const account1: Account = { BIC: 'BIC', IBAN: 'IBAN', id: 'mock-account-id1', name: 'Numer' };
export const accounts1: Account[] = [account1];
export const accountHolder1: AccountHolder = {
  id: 'mock-accountHolder-id1',
  name: 'Numer',
  officialActivityName: 'activité officiel',
  contactAddress: {
    address: '6 rue Paul Langevin',
    city: 'Ivandry',
    country: 'Madagascar',
    postalCode: '101',
  },
  companyInfo: {
    phone: '+261 34 xx xxx xx',
    email: 'numer@madagascar.mg',
    socialCapital: '100000',
    tvaNumber: '123',
    businessActivity: {
      primary: 'activité principale',
      secondary: 'activité secondaire'
    }
  }
};
export const accountHolders1: AccountHolder[] = [accountHolder1];
