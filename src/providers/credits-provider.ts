import { getAppBaseUrl } from '@/common/utils';
import {
  CreateCreditPackPurchase,
  CreateCustomCreditPurchase,
  CreditBalance,
  CreditPack,
  CreditPurchase,
  CreditPurchaseType,
  RedirectionStatusUrls,
} from '@bpartners/typescript-client';
import { creditsApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

export const CREDIT_PURCHASE_ID_PARAM = 'creditPurchaseId';

export const CREDIT_PURCHASE_STATUS_PARAM = 'creditPurchaseStatus';

export interface CreditPurchaseVariables {
  purchaseId: string;
  type: CreditPurchaseType;
  creditPackIdentifier?: string;
  quantity?: number;
  credits?: number;
}

const getCreditPurchaseRedirectionUrls = async (userId: string, purchaseId: string): Promise<RedirectionStatusUrls> => {
  const toUrl = (status: string) =>
    new URL(`${getAppBaseUrl()}/account/${userId}?${CREDIT_PURCHASE_STATUS_PARAM}=${status}&${CREDIT_PURCHASE_ID_PARAM}=${purchaseId}`).href;
  return { failureUrl: toUrl('error'), successUrl: toUrl('done') };
};

export const getCreditBalance = async (): Promise<CreditBalance> => {
  const { id } = await asyncGetUser();
  const { data } = await creditsApi().getCreditBalance(id);
  return data || {};
};

export const getCreditPacks = async (): Promise<CreditPack[]> => {
  const { data } = await creditsApi().getCreditPacks();
  return data || [];
};

export const getCreditPurchase = async (purchaseId: string): Promise<CreditPurchase> => {
  const { id } = await asyncGetUser();
  const { data } = await creditsApi().getCreditPurchaseById(id, purchaseId);
  return data || {};
};

export const submitCreditPurchase = async ({ purchaseId, type, creditPackIdentifier, quantity, credits }: CreditPurchaseVariables): Promise<CreditPurchase> => {
  const { id } = await asyncGetUser();
  const redirectionStatusUrls = await getCreditPurchaseRedirectionUrls(id, purchaseId);
  const payload: CreateCreditPackPurchase | CreateCustomCreditPurchase =
    type === CreditPurchaseType.CUSTOM
      ? { type, redirectionStatusUrls, credits: credits! }
      : { type, redirectionStatusUrls, creditPackIdentifier: creditPackIdentifier!, quantity: quantity ?? 1 };
  const { data } = await creditsApi().submitCreditPurchase(id, purchaseId, payload);
  return data || {};
};
