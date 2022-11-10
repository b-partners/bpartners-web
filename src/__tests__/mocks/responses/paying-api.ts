import { Transaction, TransactionCategory } from 'src/gen/bpClient';

export const transactions1: Array<Transaction> = [
  {
    id: 'transaction1',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22001',
    amount: -5,
    category: [
      {
        type: 'TVA 20%',
        vat: 0,
        id: 'cId',
        userDefined: true,
      },
    ],
    paymentDatetime: new Date('2022-08-18T05:34:20'),
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
        userDefined: true,
      },
    ],
    paymentDatetime: new Date('2022-08-17T03:24:00'),
  },
  {
    id: 'transaction3',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22003',
    amount: -5,
    paymentDatetime: new Date('2022-07-18T05:34:20'),
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
        userDefined: true,
      },
    ],
    paymentDatetime: new Date('2022-07-17T03:24:00'),
  },
  {
    id: 'transaction5',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22005',
    amount: -5,
    paymentDatetime: new Date('2022-06-18T05:34:20'),
  },
];

export const transactionCategories1: Array<TransactionCategory> = [
  {
    id: 't01',
    type: 'Dépenses',
    vat: 0,
    count: 100,
  },
  {
    id: 't02',
    type: 'Recettes',
    vat: 0,
    count: 120,
  },
];
