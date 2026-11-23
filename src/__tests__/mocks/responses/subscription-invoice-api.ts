import {
  PaymentStatus,
  SubscriptionInvoice,
  SubscriptionInvoiceSummaries,
  SubscriptionInvoiceSummary,
  SubscriptionInvoiceType,
} from '@bpartners/typescript-client';

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

export const buildSubscriptionInvoiceSummaries = (
  actualYear: number,
  availableYears: number[],
  invoicesByMonth: Record<number, SubscriptionInvoiceSummary[]> = {}
): SubscriptionInvoiceSummaries => ({
  actualYear,
  availableYears,
  months: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    invoiceCount: invoicesByMonth[index + 1]?.length ?? 0,
    invoices: invoicesByMonth[index + 1] ?? [],
  })),
});

export const marchInvoiceSummary: SubscriptionInvoiceSummary = {
  id: 'summary-1',
  type: SubscriptionInvoiceType.INVOICE,
  title: 'Abonnement Pro — Mars 2026',
  reference: 'FAC-2026-003',
  sendingDate: '2026-03-01',
  totalPriceWithoutVat: 4900,
  totalVat: 980,
  totalPriceWithVat: 5880,
  paymentStatus: PaymentStatus.PAID,
};

export const februaryInvoiceSummaries: SubscriptionInvoiceSummary[] = [
  { ...marchInvoiceSummary, id: 'summary-2', title: 'Abonnement Pro — Février 2026', reference: 'FAC-2026-002', sendingDate: '2026-02-01' },
  { ...marchInvoiceSummary, id: 'summary-3', title: 'Crédits d’analyses', reference: 'FAC-2026-004', sendingDate: '2026-02-12', totalPriceWithVat: 1200 },
];

export const subscriptionInvoiceSummaries2026 = buildSubscriptionInvoiceSummaries(2026, [2024, 2025, 2026], {
  2: februaryInvoiceSummaries,
  3: [marchInvoiceSummary],
});

export const subscriptionInvoiceSummaries2025 = buildSubscriptionInvoiceSummaries(2025, [2024, 2025, 2026], {
  12: [{ ...marchInvoiceSummary, id: 'summary-4', reference: 'FAC-2025-012', sendingDate: '2025-12-01' }],
});
