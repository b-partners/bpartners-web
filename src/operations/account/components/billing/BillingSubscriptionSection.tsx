import { useGetOngoingSubscriptionCommitment, useGetSubscriptionPlans } from '@/operations/account/queries';
import { EnableStatus, UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, Typography } from '@mui/material';
import { FC } from 'react';
import { BillingSection } from './BillingSection';
import {
  formatDate,
  formatEuros,
  getBillingIntervalHint,
  getBillingIntervalLabel,
  getCommitmentEndLabel,
  getYearlyDiscountBadge,
  getYearlyPricing,
  getYearlyReferenceLabel,
  hasActivePlan,
  hasTwelveMonthCommitment,
  isUsageBasedPlan,
  isYearlyBilling,
  YearlyPricing,
} from './utils';

const getAmountHint = (isUsageBased: boolean, yearlyPricing?: YearlyPricing) => {
  if (isUsageBased) return 'HT / analyse';
  if (!yearlyPricing) return 'HT / mois';
  return `HT / an · soit ${formatEuros(yearlyPricing.monthlyEquivalentCents)} HT / mois`;
};

interface BillingSubscriptionSectionProps {
  subscription?: UserSubscription;
  onUpgrade: () => void;
}

export const BillingSubscriptionSection: FC<BillingSubscriptionSectionProps> = ({ subscription, onUpgrade }) => {
  const plan = subscription?.plan;
  const isActive = hasActivePlan(subscription);
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const isUsageBased = isUsageBasedPlan(plan);
  const hasCommitment = hasTwelveMonthCommitment(subscription);
  const { commitment } = useGetOngoingSubscriptionCommitment(isActive && hasCommitment);
  const { plans } = useGetSubscriptionPlans(isActive && isYearlyBilling(subscription));
  const yearlyPricing = getYearlyPricing(
    subscription,
    plans.find(({ id }) => id === plan?.id)
  );
  const isAutomaticRenewal = commitment?.automaticRenewalStatus === EnableStatus.ENABLED;
  const billingIntervalLabel = getBillingIntervalLabel(subscription);
  const billingIntervalHint = getBillingIntervalHint(subscription);

  const getInactiveHint = () => {
    if (!isCancelled) return 'Souscrivez à une offre pour lancer vos analyses.';
    return subscription?.end ? `A pris fin le ${formatDate(subscription.end)}` : 'Aucun renouvellement prévu.';
  };

  const getRenewalHint = () => {
    if (isCancelled) return 'Aucun renouvellement, l’abonnement prend fin';
    if (isUsageBased) return 'Aucun renouvellement, facturé à chaque analyse';
    if (!subscription?.end) return 'Date de renouvellement indisponible';
    if (!hasCommitment) return 'Fin de la période payée';
    return isAutomaticRenewal ? 'Reconduction automatique' : 'Sans reconduction automatique';
  };

  return (
    <BillingSection icon={<WorkspacePremiumOutlinedIcon />} title='Mon abonnement' subtitle="L'offre active sur votre compte et son renouvellement.">
      {isActive ? (
        <>
          <Box className='billing-plan'>
            <Typography className='billing-plan-name'>{plan?.name ?? 'Abonnement BIRDIA'}</Typography>
            {plan?.description && <Typography className='billing-plan-description'>{plan.description}</Typography>}
          </Box>
          <Box className='billing-plan-meta'>
            <Box>
              <Typography className='billing-label'>Montant</Typography>
              <Typography className='billing-plan-price'>{formatEuros(yearlyPricing ? yearlyPricing.annualCents : plan?.priceInCentsWithoutVat)}</Typography>
              <Typography className='billing-hint'>{getAmountHint(isUsageBased, yearlyPricing)}</Typography>
              {!!yearlyPricing?.discountPercent && (
                <Box className='billing-price-discount-row'>
                  <Typography className='billing-price-discount'>
                    au lieu de{' '}
                    <Box component='span' className='billing-price-reference'>
                      {getYearlyReferenceLabel(yearlyPricing)}
                    </Box>
                  </Typography>
                  <Box component='span' className='billing-discount-badge'>
                    {getYearlyDiscountBadge(yearlyPricing)}
                  </Box>
                </Box>
              )}
            </Box>
            <Box>
              <Typography className='billing-label'>Paiement</Typography>
              <Typography className='billing-value'>{billingIntervalLabel}</Typography>
              <Typography className='billing-hint'>{billingIntervalHint}</Typography>
            </Box>
            {hasCommitment && (
              <Box>
                <Typography className='billing-label'>Engagement</Typography>
                <Typography className='billing-value'>12 mois</Typography>
                <Typography className='billing-hint'>{getCommitmentEndLabel(commitment)}</Typography>
              </Box>
            )}
            <Box>
              <Typography className='billing-label'>Renouvellement</Typography>
              <Typography className='billing-value'>{formatDate(subscription?.end) || '—'}</Typography>
              <Typography className='billing-hint'>{getRenewalHint()}</Typography>
            </Box>
          </Box>
        </>
      ) : (
        <Box className='billing-row'>
          <Box className='billing-row-main'>
            <Typography className='billing-value'>{'Aucun abonnement actif'}</Typography>
            <Typography className='billing-hint'>{getInactiveHint()}</Typography>
          </Box>
          <Button variant='contained' className='billing-action' name='billing-choose-subscription' onClick={onUpgrade}>
            Choisir un abonnement
          </Button>
        </Box>
      )}
    </BillingSection>
  );
};
