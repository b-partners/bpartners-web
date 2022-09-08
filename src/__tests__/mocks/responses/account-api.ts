import { Account, AccountHolder } from 'src/gen/bpClient';

export const account1: Account = { BIC: 'BIC', IBAN: 'IBAN', id: 'mock-account-id1', name: 'Numer' };
export const accounts1: Account[] = [account1];
export const accountHolder1: AccountHolder = {
  address: '6 rue Paul Langevin',
  city: 'Ivandry',
  country: 'Madagascar',
  id: 'mock-accountHolder-id1',
  name: 'Numer',
  postalCode: '101',
};
export const accountHolders1: AccountHolder[] = [accountHolder1];
