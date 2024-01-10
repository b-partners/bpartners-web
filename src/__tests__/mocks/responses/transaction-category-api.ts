import { TransactionCategory, TransactionTypeEnum } from '@bpartners/typescript-client';

const createTransactionCategory = (n: number): TransactionCategory => {
  const transactionCategory: TransactionCategory = {
    count: n * 10,
    description: 'description' + n,
    type: 'type' + n,
    id: n.toString(),
    isOther: false,
    transactionType: n % 2 === 0 ? TransactionTypeEnum.INCOME : TransactionTypeEnum.OUTCOME,
    vat: n * 5,
  };

  return transactionCategory;
};

const createAllTransactionCategory = (n: number) => {
  const result = [];
  for (let i = 3; i < n + 3; i++) {
    result.push(createTransactionCategory(i));
  }
  return result;
};

const transactionCategory1: any[] = [
  {
    count: 10,
    description: 'Autres dépenses',
    id: 1,
    isOther: true,
    transactionType: null,
    vat: 0,
    type: 'Autre',
  },
  {
    count: 10,
    description: 'Autres achats',
    id: 2,
    isOther: true,
    transactionType: null,
    vat: 0,
    type: 'Autre',
  },
  ...createAllTransactionCategory(8),
];

export default transactionCategory1;
