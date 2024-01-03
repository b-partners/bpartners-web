import { Account, AccountHolder, AccountValidationRedirection, BusinessActivity, LegalFile } from 'bpartners-react-client';

export const account1: Account = { active: true, availableBalance: 22000, bic: 'BIC', iban: 'IBAN', id: 'mock-account-id1', name: 'Numer', bank: null };
export const account2: Account = {
  active: false,
  availableBalance: 22000,
  bic: 'BIC',
  iban: 'IBAN',
  id: 'mock-account-id2',
  name: 'Numer-account-2',
  bank: null,
};
export const accounts1: Account[] = [account1, account2];
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
  feedback: null,
  contactAddress: {
    address: '6 rue Paul Langevin',
    city: 'Ivandry',
    country: 'Madagascar',
    postalCode: '101',
    prospectingPerimeter: 4,
  },
  companyInfo: {
    phone: '+261 34 xx xxx xx',
    email: 'numer@madagascar.com',
    website: 'https://bpartners.app',
    socialCapital: 100000,
    tvaNumber: '123',
    isSubjectToVat: true,
    location: null,
    townCode: 10201,
  },
  businessActivities: {
    primary: 'activité principale',
    secondary: 'activité secondaire',
  },
  revenueTargets: [
    {
      year: 2024,
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

export const validationRedirectionUrl: AccountValidationRedirection = {
  redirectionStatusUrls: { successUrl: 'dummy', failureUrl: 'dummy' },
  redirectionUrl: 'dummy',
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
export const accountHolders2: AccountHolder[] = [
  {
    ...accountHolder1,
    companyInfo: {
      ...accountHolder1.companyInfo,
      location: {
        type: 'Point',
        longitude: 2.347,
        latitude: 48.8588,
      },
    },
  },
];
export const accountHoldersFeedbackLink: AccountHolder[] = [{ ...accountHolder1, feedback: { feedbackLink: 'example.com' } }];
