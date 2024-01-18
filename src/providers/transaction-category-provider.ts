import { TransactionCategory, TransactionTypeEnum } from '@bpartners/typescript-client';
import { getCached, payingApi } from '.';

export const transactionCategoryProvider = {
  getList: async (from: string, to?: string, transactionType?: TransactionTypeEnum): Promise<TransactionCategory[]> => {
    const { accountId } = getCached.userInfo();

    return (await payingApi().getTransactionCategories(accountId, from, to, transactionType)).data;
  },
  saveOrUpdate: async (transactionId: string, transactionCategory: any): Promise<TransactionCategory[]> => {
    const { accountId } = getCached.userInfo();
    return (await payingApi().createTransactionCategories(accountId, transactionId, [transactionCategory])).data;
  },
};
