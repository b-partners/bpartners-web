import { SubscriptionInvoice, SubscriptionPlan } from '@bpartners/typescript-client';
import { payingApi, userSubscriptionApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data } = await userSubscriptionApi().getSubscriptionPlans();
  return data || [];
};

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

export const downloadSubscriptionInvoices = async (yearMonth: string) => {
  const { id } = await asyncGetUser();
  const { data } = await payingApi().getUserSubscriptionInvoices(id, yearMonth);
  const subscriptionInvoices: SubscriptionInvoice[] = data || [];

  const fileUrls = subscriptionInvoices.map(({ fileUrl }) => fileUrl?.value).filter((value): value is string => !!value);

  fileUrls.forEach((url, index) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `facture-abonnement-${yearMonth}${fileUrls.length > 1 ? `-${index + 1}` : ''}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  return fileUrls.length;
};

export const userSubscriptionProvider = {
  async init(subscriptionPlanIdentifier?: string) {
    const { id } = await asyncGetUser();
    const { data } = await userSubscriptionApi().initiateUserSubscription(id, {
      redirectionStatusUrls: await getSubscriptionRedirectionUrls(),
      ...(subscriptionPlanIdentifier ? { subscriptionPlanIdentifier } : { subscriptionType: 'ESSENTIAL' }),
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
