import { Transaction } from 'src/gen/bpClient';

export const transactions1: Array<Transaction> = [
  {
    id: 'transaction1',
    label: "Abonnement BPartners - L'essentiel",
    reference: 'BP22002',
    amount: -5,
    category: { label: 'TVA 20%' },
    paymentDatetime: new Date('2022-08-18T05:34:20'),
  },
  {
    id: 'transaction2',
    label: 'Carrelage 50m2',
    reference: 'BP22001',
    amount: 500,
    paymentDatetime: new Date('2022-08-17T03:24:00'),
  },
];
