import authProvider from './auth-provider';
import { singleAccountGetter } from './account-provider';
import { payingApi } from './api';
import { TransactionCategory, TransactionTypeEnum } from 'src/gen/bpClient';

const transactionCategoryProvider = {
  getList: async (from: string, to?: string, transactionType?: TransactionTypeEnum): Promise<TransactionCategory[]> => {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;

    return (await payingApi().getTransactionCategories(accountId, from, to, transactionType)).data;
  },
  saveOrUpdate: async (transactionId: string, transactionCategory: any): Promise<TransactionCategory[]> => {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    return (await payingApi().createTransactionCategories(accountId, transactionId, [transactionCategory])).data;
  },
};

export default transactionCategoryProvider;
