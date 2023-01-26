import { Transaction, TransactionStatus, TransactionTypeEnum, TransactionsSummary } from 'bpartners-react-client';

export const transactions: Array<Transaction> = [
  {
    id: 'transaction1',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22001',
    amount: 5,
    category: [
      {
        type: 'TVA 20%',
        vat: 0,
        id: 'cId',
      },
    ],
    paymentDatetime: new Date('2022-07-18T05:34:20'),
    status: TransactionStatus.PENDING,
    type: TransactionTypeEnum.INCOME,
  },
  {
    id: 'transaction2',
    label: 'Carrelage 50m2',
    reference: 'BP22002',
    amount: 500,
    category: [
      {
        type: 'TVA 20%',
        vat: 0,
        id: 'cId',
      },
    ],
    paymentDatetime: new Date('2022-07-18T05:34:20'),
    status: TransactionStatus.UPCOMING,
    type: TransactionTypeEnum.INCOME,
  },
  {
    id: 'transaction3',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22003',
    amount: 5,
    paymentDatetime: new Date('2022-08-18T05:34:20'),
    status: TransactionStatus.BOOKED,
    type: TransactionTypeEnum.OUTCOME,
  },
  {
    id: 'transaction4',
    label: 'Carrelage 50m2',
    reference: 'BP22004',
    amount: 500,
    category: [
      {
        type: 'TVA 20%',
        vat: 0,
        id: 'cId',
      },
    ],
    paymentDatetime: new Date('2022-07-17T03:24:00'),
    status: TransactionStatus.REJECTED,
    type: TransactionTypeEnum.OUTCOME,
  },
  {
    id: 'transaction5',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22005',
    amount: 5,
    paymentDatetime: new Date('2022-06-18T05:34:20'),
    status: TransactionStatus.UNKNOWN,
    type: TransactionTypeEnum.INCOME,
  },
];

export const transactionsSummary1: TransactionsSummary = {
  year: 2022,
  annualIncome: 0,
  annualOutcome: 0,
  annualCashFlow: 0,
  summary: [],
};

export const transactionsSummary: TransactionsSummary = {
  year: +new Date().getFullYear(),
  annualIncome: 210000,
  annualOutcome: 100000,
  annualCashFlow: 110000,
  updatedAt: new Date(),
  summary: [
    {
      month: 0,
      income: 12000,
      outcome: 0,
      updatedAt: new Date(),
      cashFlow: 12000,
    },
    {
      month: 1,
      income: 10000,
      outcome: 0,
      updatedAt: new Date(),
      cashFlow: 22000,
    },
    {
      month: 2,
      income: 0,
      outcome: 1000,
      updatedAt: new Date(),
      cashFlow: 21000,
    },
    {
      month: 3,
      income: 13000,
      outcome: 1000,
      updatedAt: new Date(),
      cashFlow: 33000,
    },
    {
      month: 4,
      income: 0,
      outcome: 3000,
      updatedAt: new Date(),
      cashFlow: 30000,
    },
    {
      month: 5,
      income: 0,
      outcome: 20000,
      updatedAt: new Date(),
      cashFlow: 10000,
    },
    {
      month: 6,
      income: 1000,
      outcome: 1000,
      updatedAt: new Date(),
      cashFlow: 10000,
    },
    {
      month: 7,
      income: 2000,
      outcome: 0,
      updatedAt: new Date(),
      cashFlow: 8000,
    },
    {
      month: 8,
      income: 1000,
      outcome: 0,
      updatedAt: new Date(),
      cashFlow: 9000,
    },
    {
      month: 9,
      income: 0,
      outcome: 0,
      updatedAt: new Date(),
      cashFlow: 9000,
    },
    {
      month: 10,
      income: 0,
      outcome: 9000,
      updatedAt: new Date(),
      cashFlow: 0,
    },
    {
      month: 11,
      income: 0,
      outcome: 0,
      updatedAt: new Date(),
      cashFlow: 0,
    },
  ],
};
