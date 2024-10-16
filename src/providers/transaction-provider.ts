import { Transaction, TransactionStatus } from '@bpartners/typescript-client';
import { asyncGetUserInfo, BpDataProviderType, getCached, payingApi } from '.';
import { TRANSACTION_STATUSES } from '../constants';

const toModelStatus = (status: TransactionStatus): TransactionStatus =>
  Object.keys(TRANSACTION_STATUSES).includes(status) ? status : TransactionStatus.UNKNOWN;

export const transactionProvider: BpDataProviderType = {
  async getOne(_id: string) {
    throw new Error('Function not implemented.');
  },
  getList: async function (page: number, perPage: number, filters = {}): Promise<any[]> {
    const { categorized, status, label } = filters;
    const { accountId } = await asyncGetUserInfo();
    const { data } = await payingApi().getTransactions(accountId, label, status, undefined, page, perPage);
    return data
      .filter(
        //TODO: following filter can be expressed in a single, well-known, logic operator. What is it?
        //TODO(implement-backend)
        ({ category }) => (categorized ? category === null : true)
      )
      .map(transaction => ({ ...transaction, status: toModelStatus(transaction.status) }));
  },
  saveOrUpdate: async function (resources: any): Promise<any> {
    const { accountId } = getCached.userInfo();
    return (await payingApi().exportTransactionsAndInvoices(accountId, resources)).data;
  },
};

export const justifyTransaction = async (transactionId: string, invoiceId: string): Promise<Transaction> => {
  const { accountId } = getCached.userInfo();
  return (await payingApi().justifyTransaction(accountId, transactionId, invoiceId)).data;
};
