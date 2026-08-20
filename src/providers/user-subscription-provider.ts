import { getAppBaseUrl } from '@/common/utils';
import {
  BillingInterval,
  CreateSubscriptionInitiation,
  EnableStatus,
  SubscriptionInvoice,
  SubscriptionPlan,
  UserSubscriptionCommitment,
  UserSubscriptionCommitmentDuration,
  UserSubscriptionPaymentMethod,
} from '@bpartners/typescript-client';
import { payingApi, userSubscriptionApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

export type SubscriptionBillingInterval = BillingInterval;

type SubscriptionInitiationPayload = CreateSubscriptionInitiation & { billingInterval: SubscriptionBillingInterval };

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data } = await userSubscriptionApi().getSubscriptionPlans();
  return data || [];
};

export const getSubscriptionCommitments = async (): Promise<UserSubscriptionCommitment[]> => {
  const { id } = await asyncGetUser();
  const { data } = await userSubscriptionApi().getUserSubscriptionCommitments(id);
  return data || [];
};

const getSubscriptionRedirectionUrls = async () => {
  const { id } = await asyncGetUser();
  return {
    failureUrl: new URL(`${getAppBaseUrl()}?stripeStatus=error`).href,
    successUrl: new URL(`${getAppBaseUrl()}/account/${id}?stripeStatus=done`).href,
  };
};

const getPaymentMethodRedirectionUrls = async () => {
  const { id } = await asyncGetUser();
  return {
    failureUrl: new URL(`${getAppBaseUrl()}?stripeStatus=error`).href,
    successUrl: new URL(`${getAppBaseUrl()}/account/${id}?stripePaymentStatus=done`).href,
  };
};

export const getDefaultPaymentMethod = async (): Promise<UserSubscriptionPaymentMethod | null> => {
  const { id } = await asyncGetUser();
  const { data } = await userSubscriptionApi().getUserPaymentMethods(id, true);
  const paymentMethods: UserSubscriptionPaymentMethod[] = data || [];
  return paymentMethods.find(({ card }) => !!card?.lastFourDigits) ?? null;
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
  async init(subscriptionPlanIdentifier?: string, billingInterval: SubscriptionBillingInterval = 'MONTHLY') {
    const { id } = await asyncGetUser();
    const payload: SubscriptionInitiationPayload = {
      redirectionStatusUrls: await getSubscriptionRedirectionUrls(),
      billingInterval,
      ...(subscriptionPlanIdentifier ? { subscriptionPlanIdentifier } : { subscriptionType: 'ESSENTIAL' }),
    };
    const { data } = await userSubscriptionApi().initiateUserSubscription(id, payload);
    return data;
  },
  async saveCommitment(subscriptionPlanIdentifier: string, automaticRenewalStatus: EnableStatus) {
    const { id } = await asyncGetUser();
    const now = new Date();
    const { data } = await userSubscriptionApi().saveUserSubscriptionCommitments(id, [
      {
        subscriptionPlanIdentifier,
        duration: UserSubscriptionCommitmentDuration.TWELVE_MONTHS,
        commitmentStart: now,
        approvalDatetime: now,
        automaticRenewalStatus,
      },
    ]);
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
  async replacePaymentMethod() {
    const { id } = await asyncGetUser();
    const { failureUrl, successUrl } = await getPaymentMethodRedirectionUrls();
    const { data } = await userSubscriptionApi().initiatePaymentMethodReplacement(id, { failureUrl, successUrl });
    return data;
  },
};
