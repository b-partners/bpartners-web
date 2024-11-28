import { userSubscriptionApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

const getStripeRedirectionUrl = () => {
  return {
    failureUrl: `${process.env.REACT_APP_URL}?error="Une erreur s'est produite, veuillez recommencer"`,
    successUrl: `${process.env.REACT_APP_URL}"`,
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
