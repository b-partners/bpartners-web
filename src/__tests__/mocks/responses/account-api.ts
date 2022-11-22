import { Account, AccountHolder, BusinessActivity } from 'src/gen/bpClient';

export const account1: Account = { BIC: 'BIC', IBAN: 'IBAN', id: 'mock-account-id1', name: 'Numer' };
export const accounts1: Account[] = [account1];
export const businessActivities: BusinessActivity[] = [
  {
    id: 'b_00',
    name: 'Agenceur',
  },
  {
    id: 'b_01',
    name: 'Architecte',
  },
  {
    id: 'b_02',
    name: "Architecte d'intérieur",
  },
  {
    id: 'b_03',
    name: 'Armurier',
  },
  {
    id: 'b_04',
    name: "Artisan tout corps d'état",
  },
  {
    id: 'b_05',
    name: 'Barbier',
  },
  {
    id: 'b_06',
    name: 'Bottier',
  },
];
export const accountHolder1: AccountHolder = {
  id: 'mock-accountHolder-id1',
  name: 'Numer',
  siren: 'Siren',
  officialActivityName: 'activité officielle',
  contactAddress: {
    address: '6 rue Paul Langevin',
    city: 'Ivandry',
    country: 'Madagascar',
    postalCode: '101',
  },
  companyInfo: {
    phone: '+261 34 xx xx xx',
    email: 'numer@madagascar.com',
    socialCapital: 100000,
    tvaNumber: '123',
  },
  businessActivities: {
    primary: 'activité principale',
    secondary: 'activité secondaire',
  },
};
export const accountHolders1: AccountHolder[] = [accountHolder1];
