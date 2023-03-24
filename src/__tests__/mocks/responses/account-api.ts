import { Account, AccountHolder, BusinessActivity, LegalFile } from 'bpartners-react-client';

export const account1: Account = { availableBalance: 22000, BIC: 'BIC', IBAN: 'IBAN', id: 'mock-account-id1', name: 'Numer' };
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
    phone: '+261 34 xx xxx xx',
    email: 'numer@madagascar.com',
    socialCapital: 100000,
    tvaNumber: '123',
    isSubjectToVat: true,
    location: null,
    townCode: 102010,
  },
  businessActivities: {
    primary: 'activité principale',
    secondary: 'activité secondaire',
  },
  revenueTargets: [
    {
      year: 2023,
      amountTarget: 12000000,
      amountAttempted: 1200000,
      amountAttemptedPercent: 1000,
      updatedAt: new Date(),
    },
    {
      year: 2021,
      amountTarget: 12000000,
      amountAttempted: 13000000,
      amountAttemptedPercent: 10833,
      updatedAt: new Date(),
    },
  ],
};

export const legalFiles1: LegalFile[] = [
  {
    id: 'legal-file-1',
    name: 'legal file version 1',
    fileUrl: 'https://clri-ltc.ca/files/2018/09/TEMP-PDF-Document.pdf',
    toBeConfirmed: true,
  },
  {
    id: 'legal-file-2',
    name: 'legal file version 2',
    fileUrl: 'https://clri-ltc.ca/files/2018/09/TEMP-PDF-Document.pdf',
    toBeConfirmed: true,
  },
  {
    id: 'legal-file-3',
    name: 'legal file version 3',
    fileUrl: 'dummy-url',
    approvalDatetime: new Date(),
    toBeConfirmed: true,
  },
];

export const accountHolders1: AccountHolder[] = [accountHolder1];
