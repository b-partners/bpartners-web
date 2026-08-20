import {
  CreditPack,
  CreditPurchaseType,
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

export const getBillingIntervalLabel = (subscription?: UserSubscription, commitment?: UserSubscriptionCommitment, isCommitmentUnknown = false) => {
  if (isUsageBasedPlan(subscription?.plan)) return 'À l’analyse';
  if (isCommitmentUnknown) return '—';
  return commitment ? 'MENSUEL' : 'ANNUEL';
};

export const getBillingIntervalHint = (subscription?: UserSubscription, commitment?: UserSubscriptionCommitment, isCommitmentUnknown = false) => {
  if (isUsageBasedPlan(subscription?.plan)) return 'Facturé à chaque analyse';
  if (isCommitmentUnknown) return 'Périodicité indisponible pour le moment';
  return commitment ? 'Prélevé chaque début de mois' : 'Payé en une fois pour l’année';
};

export const getCommitmentEndLabel = (commitment?: UserSubscriptionCommitment) => {
  const end = formatDate(commitment?.commitmentEnd);
  return end ? `Jusqu’au ${end}` : 'Engagement en cours';
};

const isCustomPack = (pack: CreditPack) => pack.creditPurchaseType === CreditPurchaseType.CUSTOM;

export const getPackTotalCents = (pack: CreditPack, credits: number, quantity: number) =>
  isCustomPack(pack) ? credits * (pack.creditUnitPriceInCentsWithVat ?? 0) : (pack.priceInCentsWithVat ?? 0) * quantity;

export const getPackCredits = (pack: CreditPack, credits: number, quantity: number) => (isCustomPack(pack) ? credits : (pack.credits ?? 0) * quantity);
