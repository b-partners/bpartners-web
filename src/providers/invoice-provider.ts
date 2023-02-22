import authProvider from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';
import { payingApi } from './api';
import { singleAccountGetter } from './account-provider';
import { Invoice, InvoicePaymentTypeEnum, InvoiceStatus } from 'bpartners-react-client';
import emptyToNull from 'src/common/utils/empty-to-null';
import { sumOfRegulationsPercentages, TPaymentRegulation } from 'src/operations/invoice/utils';
import { getNextMonthDate } from 'src/common/utils/date';
import { toMinors } from 'src/common/utils/percent';

export const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
  const userId = authProvider.getCachedWhoami().user.id;
  const accountId: any = (await singleAccountGetter(userId)).id;
  return { userId, accountId };
};

const formatPaymentRegulation = (paymentRegulations: TPaymentRegulation[]) => {
  if (!paymentRegulations || paymentRegulations.length === 0) return paymentRegulations;
  const percentage = sumOfRegulationsPercentages(paymentRegulations);
  const lastDate = paymentRegulations.sort((a, b) => new Date(b.maturityDate).getTime() - new Date(a.maturityDate).getTime())[0].maturityDate;
  if (percentage !== 0) {
    const newPaymentRegulation: TPaymentRegulation = {
      amount: null,
      percent: toMinors(percentage),
      comment: null,
      maturityDate: getNextMonthDate(lastDate),
    };
    return [...paymentRegulations.map(e => ({ ...e, percent: toMinors(e.percent) })), newPaymentRegulation];
  }
  return paymentRegulations;
};

export const invoiceProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const invoiceTypes: Array<InvoiceStatus> = filter.invoiceTypes;

    return Promise.all(
      // TODO: this has to be done backend-side.
      // In particular, front-end side pagination is at best inefficient, and at worst broken (case here).
      invoiceTypes.map(invoiceType =>
        payingApi()
          .getInvoices(accountId, page, perPage, invoiceType)
          .then(({ data }) => data)
      )
    ).then(listOfLists => listOfLists.flat());
  },
  getOne: function (id: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async function (_invoices: any[]): Promise<any[]> {
    const { accountId } = await getUserInfo();
    const invoices = { ..._invoices[0] };
    const newPaymentRegulations = formatPaymentRegulation(invoices.paymentRegulations);
    const formattedInvoice = { ...emptyToNull({ ...invoices, paymentRegulations: newPaymentRegulations }) };

    if (formattedInvoice.paymentType === InvoicePaymentTypeEnum.CASH) {
      formattedInvoice.paymentRegulations = undefined;
    }

    return payingApi()
      .crupdateInvoice(accountId, _invoices[0].id, formattedInvoice)
      .then(({ data }) => [data]);
  },
};

export default invoiceProvider;
