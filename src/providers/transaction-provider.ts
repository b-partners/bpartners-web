import authProvider from './auth-provider';
import { singleAccountGetter } from './account-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { payingApi } from './api';
import { Transaction, TransactionStatus } from 'bpartners-react-client';
import { TRANSACTION_STATUSES } from 'src/constants/transaction-status';

const toModelStatus = (status: TransactionStatus): TransactionStatus =>
  Object.keys(TRANSACTION_STATUSES).includes(status) ? status : TransactionStatus.UNKNOWN;

const transactionProvider: BpDataProviderType = {
  async getOne(id: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, { categorized, status }: any): Promise<any[]> {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    //TODO: implements transaction pagination on the back side
    const { data } = await payingApi().getTransactions(accountId, page, perPage);

    return data
      .filter(
        //TODO: following filter can be expressed in a single, well-known, logic operator. What is it?
        //TODO(implement-backend)
        ({ category }) => !categorized || category == null
      )
      .filter(transaction => (status ? transaction.status === status : true))
      .map(transaction => ({ ...transaction, status: toModelStatus(transaction.status) }));
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export const justifyTransaction = async (transactionId: string, invoiceId: string): Promise<Transaction> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId = (await singleAccountGetter(userId)).id;
  return (await payingApi().justifyTransaction(accountId, transactionId, invoiceId)).data;
};

export default transactionProvider;
