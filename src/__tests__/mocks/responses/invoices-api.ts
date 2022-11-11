import { customers1 } from './customer-api';
import { products1 } from './product-api';

export const createInvoices = (n: number, status: string) => {
  const invoices = [];
  for (let i = 0; i < n; i++) {
    invoices.push({
      customer: customers1[i < 2 ? 0 : i < 4 ? 1 : 2],
      fileId: 'file-id',
      id: 'invoice-id-' + i,
      paymentUrl: 'paymentUrl-' + i,
      products: [products1[0], products1[1]],
      ref: 'invoice-ref-' + i,
      sendingDate: '2022-05-10',
      toPayAt: '2022-05-15',
      status,
      title: 'invoice-title-' + i,
      totalPriceWithoutVat: 10000,
      totalPriceWithVat: 12000,
      totalVat: 2000,
    });
  }
  return invoices;
};
