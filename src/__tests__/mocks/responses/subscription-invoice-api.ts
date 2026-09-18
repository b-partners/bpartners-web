import { PaymentStatus, SubscriptionInvoice } from '@bpartners/typescript-client';

export const subscriptionInvoiceSingle: SubscriptionInvoice[] = [
  { fileUrl: { value: 'https://s3.dummy.app/facture-abonnement-mars.pdf', expirationDelay: 3600 } },
];

export const subscriptionInvoiceMultiple: SubscriptionInvoice[] = [
  { fileUrl: { value: 'https://s3.dummy.app/facture-abonnement-1.pdf', expirationDelay: 3600 } },
  { fileUrl: { value: 'https://s3.dummy.app/facture-abonnement-2.pdf', expirationDelay: 3600 } },
];

export const subscriptionInvoiceWithoutFile: SubscriptionInvoice[] = [{ fileUrl: {} }];

export const unpaidSubscriptionInvoices: SubscriptionInvoice[] = [
  {
    paymentStatus: PaymentStatus.UNPAID,
    paymentUrl: 'https://stripe.dummy.app/pay/invoice-1',
    invoice: {
      id: 'inv-1',
      ref: 'FAC-2026-001',
      title: 'Facture pour la période de 01/08/2026 au 31/08/2026',
      totalPriceWithVat: 5880,
      createdAt: new Date('2026-09-18T00:00:00Z'),
      toPayAt: '2026-09-30',
    },
  },
  {
    paymentStatus: PaymentStatus.UNPAID,
    paymentUrl: 'https://stripe.dummy.app/pay/invoice-2',
    invoice: {
      id: 'inv-2',
      ref: 'FAC-2026-002',
      title: 'Abonnement Essentiel — Février 2026',
      totalPriceWithVat: 4990,
      createdAt: new Date('2026-02-05T00:00:00Z'),
      toPayAt: '2026-02-28',
    },
  },
];

export const unpaidSubscriptionInvoiceNoUrl: SubscriptionInvoice[] = [
  { paymentStatus: PaymentStatus.UNPAID, invoice: { id: 'inv-3', ref: 'FAC-2026-003', totalPriceWithVat: 2990 } },
];

export const unpaidSubscriptionInvoiceNoMeta: SubscriptionInvoice[] = [
  { paymentStatus: PaymentStatus.UNPAID, paymentUrl: 'https://stripe.dummy.app/pay/invoice-4' },
];
