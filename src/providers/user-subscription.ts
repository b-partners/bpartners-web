import { userSubscriptionApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

const getStripeRedirectionUrl = () => {
  return {
    failureUrl: new URL(`${process.env.REACT_APP_URL}?stripeStatus=error`).href,
    successUrl: new URL(`${process.env.REACT_APP_URL}?stripeStatus=done`).href,
  };
};

export const userSubscriptionProvider = {
  async init() {
    const { id } = await asyncGetUser();
    const { data } = await userSubscriptionApi().initiateUserSubscription(id, {
      redirectionStatusUrls: getStripeRedirectionUrl(),
      subscriptionType: 'ESSENTIAL',
    });
    return data;
  },
};
