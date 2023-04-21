import { TransactionCategory, TransactionTypeEnum } from 'bpartners-react-client';
import { payingApi } from './api';
import { getUserInfo } from './utils';

const transactionCategoryProvider = {
  getList: async (from: string, to?: string, transactionType?: TransactionTypeEnum): Promise<TransactionCategory[]> => {
    const { accountId } = await getUserInfo();

    return (await payingApi().getTransactionCategories(accountId, from, to, transactionType)).data;
  },
  saveOrUpdate: async (transactionId: string, transactionCategory: any): Promise<TransactionCategory[]> => {
    const { accountId } = await getUserInfo();
    return (await payingApi().createTransactionCategories(accountId, transactionId, [transactionCategory])).data;
  },
};

export default transactionCategoryProvider;
