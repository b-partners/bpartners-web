import {ArchiveStatus, InvoiceStatus} from 'bpartners-react-client';
import {invoiceMapper} from 'src/operations/invoice/utils/invoice-utils';
import {asyncGetAccountId, getCached, payingApi} from '.';
import {BpDataProviderType} from './bp-data-provider-type';

export const invoiceProvider: BpDataProviderType = {
    getList: async function (page: number, perPage: number, filter: any): Promise<any[]> {
        const accountId = await asyncGetAccountId();
        const invoiceTypes: Array<InvoiceStatus> = filter.invoiceTypes;
        return (await payingApi().getInvoices(accountId, page, perPage, undefined, invoiceTypes, ArchiveStatus.ENABLED)).data;
    },
    getOne: async function (invoiceId: string): Promise<any> {
        const {accountId} = getCached.userInfo();
        const {data: invoice} = await payingApi().getInvoiceById(accountId, invoiceId);
        return invoiceMapper.toDomain(invoice);
    },
    saveOrUpdate: async function (_invoices: any[], option = {}): Promise<any[]> {
        const {accountId} = getCached.userInfo();
        const restInvoice = invoiceMapper.toRest({..._invoices[0]});

        return payingApi()
            .crupdateInvoice(accountId, restInvoice.id, restInvoice)
            .then(({data}) => [data]);
    },
    archive: async (resources: any[]) => {
        const {accountId} = getCached.userInfo();
        return (await payingApi().archiveInvoices(accountId, resources)).data;
    },
};
