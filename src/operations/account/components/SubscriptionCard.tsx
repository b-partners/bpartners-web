import { SubscriptionModal } from '@/common/components';
import { useToggle } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { useGetSubscriptionPlans } from '@/operations/account/queries';
import { CREDIT_PURCHASE_STATUS_PARAM, profileProvider } from '@/providers';
import { SubscriptionPlanDescription, UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useRecordContext, useRefresh } from 'react-admin';
import { useSearchParams } from 'react-router-dom';
import { BillingModal } from './billing';
import { getYearlyDiscountBadge, getYearlyPricing, getYearlyReferenceLabel, hasTwelveMonthCommitment, isYearlyBilling, YearlyPricing } from './billing/utils';
import { subscriptionFeatures } from './subscriptionFeatures';

const VALIDATION_POLL_INTERVAL_MS = 3000;

const eurosFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const formatEuros = (cents: number) => `${eurosFormatter.format(cents / 100)} €`;

const isUsageBased = (plan?: SubscriptionPlanDescription) => plan?.billingType === 'USAGE_BASED';

const getPriceCents = (plan?: SubscriptionPlanDescription) => plan?.priceInCentsWithoutVat ?? 4900;

const getPriceSuffix = (plan?: SubscriptionPlanDescription) => (isUsageBased(plan) ? '/ analyse' : '/ mois');

const getPriceHt = (subscription?: UserSubscription, yearlyPricing?: YearlyPricing) => {
  if (isUsageBased(subscription?.plan)) return 'Prix HT · aucun abonnement';
  if (!subscription?.billingInterval) return 'Prix HT';
  if (hasTwelveMonthCommitment(subscription)) return 'HT · engagement annuel 12 mois';
  if (!yearlyPricing) return 'Prix HT · payé en une fois';
  return `Prix HT · payé en une fois · soit ${formatEuros(yearlyPricing.monthlyEquivalentCents)} HT / mois`;
};

const getYearlyLabel = (subscription?: UserSubscription) =>
  hasTwelveMonthCommitment(subscription) ? `${formatEuros(getPriceCents(subscription?.plan) * 12)} HT / an` : '';

const getFeatures = (plan?: SubscriptionPlanDescription) => {
  const features = plan?.features ?? [];
  return features.length > 0 ? features : subscriptionFeatures.map(({ text }) => text);
};

const INACTIVE_SUBSCRIPTION_STATUSES: (UserSubscriptionStatus | undefined)[] = [UserSubscriptionStatus.EMPTY, UserSubscriptionStatus.CANCELLED];

export const SubscriptionCard = () => {
  const { value: isBillingModalOpen, handleOpen, handleClose } = useToggle();
  const { open: openDialog } = useDialog();
  const record = useRecordContext();
  const refresh = useRefresh();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = record?.user?.id as string | undefined;
  const subscription = record?.user?.subscription as UserSubscription | undefined;
  const plan = subscription?.plan;
  const hasActiveSubscription = !!plan && !INACTIVE_SUBSCRIPTION_STATUSES.includes(subscription?.status);
  const isValidating = !plan && subscription?.status === UserSubscriptionStatus.ACTIVE;
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const features = getFeatures(plan);
  const { plans } = useGetSubscriptionPlans(hasActiveSubscription && isYearlyBilling(subscription));
  const yearlyPricing = getYearlyPricing(
    subscription,
    plans.find(({ id }) => id === plan?.id)
  );
  const yearlyLabel = getYearlyLabel(subscription);

  const openSubscriptionModal = () => openDialog(<SubscriptionModal allowClose />, { maxWidth: 'lg', fullWidth: true }, true);

  useEffect(() => {
    const isStripeDone = searchParams.get('stripeStatus') === 'done' || searchParams.get('stripePaymentStatus') === 'done';
    if (!searchParams.get(CREDIT_PURCHASE_STATUS_PARAM) && !isStripeDone) return;
    handleOpen();
    if (isStripeDone) {
      const params = new URLSearchParams(searchParams);
      params.delete('stripeStatus');
      params.delete('stripePaymentStatus');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isValidating || !userId) return;
    let cancelled = false;
    const interval = setInterval(() => {
      profileProvider
        .getOne(userId)
        .then(freshUser => {
          if (!cancelled && (freshUser as { subscription?: UserSubscription })?.subscription?.plan) {
            clearInterval(interval);
            refresh();
          }
        })
        .catch(() => undefined);
    }, VALIDATION_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isValidating, userId, refresh]);

  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Box className='subscription-header'>
          <Typography className='subscription-title'>Mon abonnement</Typography>
          <Button variant='contained' className='export-invoice-action' name='open-billing-modal' onClick={handleOpen}>
            Accéder à la facturation
          </Button>
        </Box>

        {isValidating ? (
          <Box className='subscription-validating'>
            <CircularProgress size={22} />
            <Typography className='subscription-validating-text'>Validation de votre abonnement en cours…</Typography>
          </Box>
        ) : hasActiveSubscription ? (
          <>
            <Box className='subscription-plan'>
              <Box className='subscription-plan-icon'>
                <WorkspacePremiumOutlinedIcon />
              </Box>
              <Box className='subscription-plan-info'>
                <Typography className='subscription-plan-name'>{plan?.name ?? 'Abonnement BIRDIA'}</Typography>
                {plan?.description && <Typography className='subscription-plan-subtitle'>{plan.description}</Typography>}
              </Box>
            </Box>

            <Box className='subscription-price-row'>
              <Typography component='span' className='subscription-price'>
                {formatEuros(yearlyPricing ? yearlyPricing.annualCents : getPriceCents(plan))}
              </Typography>
              <Typography component='span' className='subscription-price-suffix'>
                {yearlyPricing ? '/ an' : getPriceSuffix(plan)}
              </Typography>
              {!!yearlyPricing?.discountPercent && (
                <>
                  <Typography component='span' className='subscription-price-discount'>
                    au lieu de{' '}
                    <Box component='span' className='subscription-price-reference'>
                      {getYearlyReferenceLabel(yearlyPricing)}
                    </Box>
                  </Typography>
                  <Box component='span' className='subscription-discount-badge'>
                    {getYearlyDiscountBadge(yearlyPricing)}
                  </Box>
                </>
              )}
            </Box>
            <Typography className='subscription-price-ht'>{getPriceHt(subscription, yearlyPricing)}</Typography>
            {yearlyLabel && <Typography className='subscription-price-yearly'>{yearlyLabel}</Typography>}

            <Box component='ul' className='subscription-features'>
              {features.map((feature, index) => (
                <Box component='li' key={index} className={`subscription-feature${index === 0 ? ' subscription-feature--strong' : ''}`}>
                  <Box component='span' className='subscription-feature-check'>
                    <CheckRoundedIcon />
                  </Box>
                  {feature}
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Box className='subscription-empty'>
            {isCancelled ? (
              <>
                <Typography className='subscription-empty-text'>Renouveler votre abonnement, choisissez l'offre qui vous correspond le mieux.</Typography>
              </>
            ) : (
              <Typography className='subscription-empty-text'>Vous n’avez pas d’abonnement actif.</Typography>
            )}
            <Button variant='contained' className='choose-subscription-action' name='open-subscription-modal' onClick={openSubscriptionModal}>
              Choisir un abonnement
            </Button>
          </Box>
        )}

        <BillingModal open={isBillingModalOpen} onClose={handleClose} subscription={subscription} />
      </CardContent>
    </Card>
  );
};
