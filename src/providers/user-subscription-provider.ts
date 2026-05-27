import { userSubscriptionApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

const getSubscriptionRedirectionUrls = async () => {
  const { id } = await asyncGetUser();
  return {
    failureUrl: new URL(`${process.env.REACT_APP_URL}?stripeStatus=error`).href,
    successUrl: new URL(`${process.env.REACT_APP_URL}/account/${id}?stripeStatus=done`).href,
  };
};

const getPaymentMethodRedirectionUrls = async () => {
  const { id } = await asyncGetUser();
  return {
    failureUrl: new URL(`${process.env.REACT_APP_URL}?stripeStatus=error`).href,
    successUrl: new URL(`${process.env.REACT_APP_URL}/account/${id}?stripePaymentStatus=done`).href,
  };
};

export const userSubscriptionProvider = {
  async init() {
    const { id } = await asyncGetUser();
    const { data } = await userSubscriptionApi().initiateUserSubscription(id, {
      redirectionStatusUrls: await getSubscriptionRedirectionUrls(),
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
    const { failureUrl, successUrl } = await getPaymentMethodRedirectionUrls();
    const { data } = await userSubscriptionApi().initiateBillingPortal(id, { failureUrl, successUrl });
    return data;
  },
  async checkoutSetup() {
    const { id } = await asyncGetUser();
    const { failureUrl, successUrl } = await getPaymentMethodRedirectionUrls();
    const { data } = await userSubscriptionApi().initiatePaymentMethodInsertion(id, { failureUrl, successUrl });
    return data;
  },
};
