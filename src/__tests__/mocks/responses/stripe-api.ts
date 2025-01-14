import { Redirection, User, Whoami } from '@bpartners/typescript-client';
import { user1 } from './security-api';

export const user_empty_stripe: User = {
  ...user1,
  subscription: {
    end: null,
    start: null,
    status: 'EMPTY',
  },
};
export const whoami_empty_stripe: Whoami = { user: user_empty_stripe };

export const user_active_stripe: User = {
  ...user1,
  subscription: {
    end: new Date(new Date().getFullYear() + '-10-10'),
    start: new Date(new Date().getFullYear() + '-09-10'),
    status: 'ACTIVE',
  },
};
export const whoami_active_stripe: Whoami = { user: user_active_stripe };

export const user_cancelled_stripe: User = {
  ...user1,
  subscription: {
    end: new Date(new Date().getFullYear() + '-10-10'),
    start: new Date(new Date().getFullYear() + '-09-10'),
    status: 'CANCELLED',
  },
};
export const whoami_cancelled_stripe: Whoami = { user: user_cancelled_stripe };

export const user_free_trial_stripe: User = {
  ...user1,
  subscription: {
    end: new Date(new Date().getFullYear() + '-10-10'),
    start: new Date(new Date().getFullYear() + '-09-10'),
    status: 'FREE_TRIAL',
  },
};
export const whoami_free_trial_stripe: Whoami = { user: user_free_trial_stripe };

export const expectedStripeSubscriptionBody = {
  redirectionStatusUrls: {
    failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
    successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripeStatus=done',
  },
  subscriptionType: 'ESSENTIAL',
};

export const stripeSubscriptionResponse: Redirection = {
  redirectionStatusUrls: expectedStripeSubscriptionBody.redirectionStatusUrls,
  redirectionUrl: 'http://dummy-url.com',
};
