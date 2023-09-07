import { Transaction, TransactionStatus } from 'bpartners-react-client';
import { BpDataProviderType, asyncGetUserInfo, getCached, payingApi } from '.';
import { TRANSACTION_STATUSES } from '../constants/transaction-status';

const toModelStatus = (status: TransactionStatus): TransactionStatus =>
  Object.keys(TRANSACTION_STATUSES).includes(status) ? status : TransactionStatus.UNKNOWN;

export const transactionProvider: BpDataProviderType = {
  async getOne(id: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, { categorized, status }: any): Promise<any[]> {
    const { accountId } = await asyncGetUserInfo();
    //TODO: implements transaction pagination on the back side
    //TODO: implements transaction search by label in another commit
    const { data } = await payingApi().getTransactions(accountId, undefined, page, perPage);

    return data
      .filter(
        //TODO: following filter can be expressed in a single, well-known, logic operator. What is it?
        //TODO(implement-backend)
        ({ category }) => (categorized ? category === null : true)
      )
      .filter(transaction => (status ? transaction.status === status : true))
      .map(transaction => ({ ...transaction, status: toModelStatus(transaction.status) }));
  },
  saveOrUpdate: function (resources: any[]): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

export const justifyTransaction = async (transactionId: string, invoiceId: string): Promise<Transaction> => {
  const { accountId } = getCached.userInfo();
  return (await payingApi().justifyTransaction(accountId, transactionId, invoiceId)).data;
};
