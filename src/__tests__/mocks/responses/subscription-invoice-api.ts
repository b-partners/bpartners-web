import { SubscriptionInvoice } from '@bpartners/typescript-client';

export const subscriptionInvoiceSingle: SubscriptionInvoice[] = [
  { fileUrl: { value: 'https://s3.dummy.app/facture-abonnement-mars.pdf', expirationDelay: 3600 } },
];

export const subscriptionInvoiceMultiple: SubscriptionInvoice[] = [
  { fileUrl: { value: 'https://s3.dummy.app/facture-abonnement-1.pdf', expirationDelay: 3600 } },
  { fileUrl: { value: 'https://s3.dummy.app/facture-abonnement-2.pdf', expirationDelay: 3600 } },
];

export const subscriptionInvoiceWithoutFile: SubscriptionInvoice[] = [{ fileUrl: {} }];
