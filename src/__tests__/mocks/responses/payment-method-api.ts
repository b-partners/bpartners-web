import { UserSubscriptionPaymentMethod } from '@bpartners/typescript-client';

export const visaPaymentMethods: UserSubscriptionPaymentMethod[] = [
  {
    type: 'card',
    card: { displayBrand: 'VISA', lastFourDigits: '4242', expirationMonth: 4, expirationYear: 2028 },
  },
];
