import {
  BillingInterval,
  CreditPack,
  CreditPurchaseType,
  EnableStatus,
  SubscriptionBillingType,
  SubscriptionCard,
  SubscriptionCardDisplayBrand,
  SubscriptionPlan,
  SubscriptionPlanDescription,
  UserSubscription,
  UserSubscriptionCommitment,
  UserSubscriptionStatus,
} from '@bpartners/typescript-client';
import dayjs from 'dayjs';

const eurosFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const unitEurosFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const creditsFormatter = new Intl.NumberFormat('fr-FR');

export const INACTIVE_SUBSCRIPTION_STATUSES: (UserSubscriptionStatus | undefined)[] = [UserSubscriptionStatus.EMPTY, UserSubscriptionStatus.CANCELLED];

export type AnyPlan = SubscriptionPlan | SubscriptionPlanDescription;

export const formatEuros = (cents?: number) => `${eurosFormatter.format((cents ?? 0) / 100)} €`;

export const formatUnitEuros = (cents?: number) => `${unitEurosFormatter.format((cents ?? 0) / 100)} €`;

export const formatCredits = (credits?: number) => creditsFormatter.format(credits ?? 0);

export const formatDate = (date?: Date | string | null) => (date ? dayjs(date).format('DD/MM/YYYY') : '');

export const isUsageBasedPlan = (plan?: AnyPlan) => plan?.billingType === SubscriptionBillingType.USAGE_BASED;

export const getPlanAmount = (plan?: AnyPlan) => (isUsageBasedPlan(plan) ? 0 : plan?.priceInCentsWithoutVat ?? 0);

const CARD_BRAND_LABELS: Partial<Record<SubscriptionCardDisplayBrand, string>> = {
  AMERICAN_EXPRESS: 'American Express',
  CARTES_BANCAIRES: 'Cartes Bancaires',
  DINERS_CLUB: 'Diners Club',
  MASTERCARD: 'Mastercard',
  UNIONPAY: 'UnionPay',
  VISA: 'Visa',
};

export const formatCardBrand = (brand?: SubscriptionCardDisplayBrand) => (brand && CARD_BRAND_LABELS[brand]) || 'Carte';

export const formatCardExpiration = ({ expirationMonth, expirationYear }: SubscriptionCard) =>
  expirationMonth && expirationYear ? `Expire le ${String(expirationMonth).padStart(2, '0')}/${expirationYear}` : 'Date d’expiration indisponible';

export const isSubscriptionCancellationEnabled = () => process.env.REACT_APP_SUBSCRIPTION_CANCELLATION === 'true';

export const hasActivePlan = (subscription?: UserSubscription) => !!subscription?.plan && !INACTIVE_SUBSCRIPTION_STATUSES.includes(subscription?.status);

export const isHighestPlan = (currentPlan: AnyPlan | undefined, plans: SubscriptionPlan[]) =>
  plans.length > 0 && getPlanAmount(currentPlan) >= Math.max(...plans.map(getPlanAmount));

export const isMonthlyBilling = (subscription?: UserSubscription) => subscription?.billingInterval === BillingInterval.MONTHLY;

export const isYearlyBilling = (subscription?: UserSubscription) => subscription?.billingInterval === BillingInterval.YEARLY;

export const hasTwelveMonthCommitment = (subscription?: UserSubscription) => !isUsageBasedPlan(subscription?.plan) && isMonthlyBilling(subscription);

const roundToEuros = (cents: number) => Math.round(cents / 100) * 100;

export interface YearlyPricing {
  annualCents: number;
  referenceCents: number;
  monthlyEquivalentCents: number;
  discountPercent: number;
}

export const getYearlyPricing = (subscription?: UserSubscription, plan?: SubscriptionPlan): YearlyPricing | undefined => {
  const annualCents = plan?.annualPriceInCentsWithoutVat;
  if (!annualCents || isUsageBasedPlan(subscription?.plan) || !isYearlyBilling(subscription)) return undefined;
  const referenceCents = (subscription?.plan?.priceInCentsWithoutVat ?? plan?.priceInCentsWithoutVat ?? 0) * 12;
  return {
    annualCents,
    referenceCents,
    monthlyEquivalentCents: roundToEuros(annualCents / 12),
    discountPercent: referenceCents > annualCents ? Math.round((1 - annualCents / referenceCents) * 100) : 0,
  };
};

export const getYearlyDiscountBadge = ({ discountPercent }: YearlyPricing) => `-${discountPercent} %`;

export const getYearlyReferenceLabel = ({ referenceCents }: YearlyPricing) => `${formatEuros(referenceCents)} / an`;

export const getBillingIntervalLabel = (subscription?: UserSubscription) => {
  if (isUsageBasedPlan(subscription?.plan)) return 'À l’analyse';
  if (!subscription?.billingInterval) return '—';
  return isMonthlyBilling(subscription) ? 'MENSUEL' : 'ANNUEL';
};

export const getBillingIntervalHint = (subscription?: UserSubscription) => {
  if (isUsageBasedPlan(subscription?.plan)) return 'Facturé à chaque analyse';
  if (!subscription?.billingInterval) return 'Périodicité définie au premier paiement';
  return isMonthlyBilling(subscription) ? 'Prélevé chaque début de mois' : 'Payé en une fois pour l’année';
};

export const getCommitmentEndLabel = (commitment?: UserSubscriptionCommitment) => {
  if (!commitment) return 'Engagement en cours';
  const end = formatDate(commitment.commitmentEnd);
  const period = end ? `Jusqu’au ${end}` : 'Engagement en cours';
  return commitment.automaticRenewalStatus === EnableStatus.ENABLED ? period : `${period} · sans reconduction`;
};

const isCustomPack = (pack: CreditPack) => pack.creditPurchaseType === CreditPurchaseType.CUSTOM;

export const getPackTotalCents = (pack: CreditPack, credits: number, quantity: number) =>
  isCustomPack(pack) ? credits * (pack.creditUnitPriceInCentsWithVat ?? 0) : (pack.priceInCentsWithVat ?? 0) * quantity;

export const getPackCredits = (pack: CreditPack, credits: number, quantity: number) => (isCustomPack(pack) ? credits : (pack.credits ?? 0) * quantity);
