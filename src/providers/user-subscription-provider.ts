import { userSubscriptionApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

const getStripeRedirectionUrl = async () => {
  const { id } = await asyncGetUser();
  return {
    failureUrl: new URL(`${process.env.REACT_APP_URL}?stripeStatus=error`).href,
    successUrl: new URL(`${process.env.REACT_APP_URL}/account/${id}?stripeStatus=done`).href,
  };
};

export const userSubscriptionProvider = {
  async init() {
    const { id } = await asyncGetUser();
    const { data } = await userSubscriptionApi().initiateUserSubscription(id, {
      redirectionStatusUrls: await getStripeRedirectionUrl(),
      subscriptionType: 'ESSENTIAL',
    });
    return data;
  },
  async cancelRenew() {
    const { id } = await asyncGetUser();
    const { data } = await userSubscriptionApi().cancelUserSubscription(id);
    return data;
  },
  async billingPortal() {
    const { id } = await asyncGetUser();
    const { failureUrl, successUrl } = await getStripeRedirectionUrl();
    const { data } = await userSubscriptionApi().initiateBillingPortal(id, { failureUrl, successUrl });
    return data;
  },
};
