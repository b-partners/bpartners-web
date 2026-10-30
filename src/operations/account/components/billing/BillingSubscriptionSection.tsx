import { useGetInProgressSubscriptionUpgrade, useGetLatestSubscriptionCommitment, useGetSubscriptionPlans } from '@/operations/account/queries';
import { EnableStatus, UserSubscription } from '@bpartners/typescript-client';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, Typography } from '@mui/material';
import { FC } from 'react';
import { BillingSection } from './BillingSection';
import {
  formatEuros,
  getBillingIntervalHint,
  getBillingIntervalLabel,
  getCommitmentEndLabel,
  getYearlyDiscountBadge,
  getYearlyPricing,
  getYearlyReferenceLabel,
  hasActivePlan,
  hasTwelveMonthCommitment,
  hasUpgradeTarget,
  isUpgradeMode,
  isUsageBasedPlan,
  isYearlyBilling,
  YearlyPricing,
} from './utils';

const getAmountHint = (isUsageBased: boolean, yearlyPricing?: YearlyPricing) => {
  if (isUsageBased) return 'HT / analyse';
  if (!yearlyPricing) return 'HT / mois';
  return `HT / an · soit ${formatEuros(yearlyPricing.monthlyEquivalentCents)} HT / mois`;
};

const getChangePlanHint = (hasInProgressUpgrade: boolean, hasHigherOffer: boolean) => {
  if (hasInProgressUpgrade) return 'Un changement d’offre est déjà en cours : vous ne pouvez pas en lancer un nouveau tant qu’il n’est pas terminé.';
  return hasHigherOffer ? 'Passez à une offre supérieure pour plus d’analyses et de fonctionnalités.' : 'Vous bénéficiez déjà de l’offre la plus élevée.';
};

interface BillingSubscriptionSectionProps {
  subscription?: UserSubscription;
  onUpgrade: () => void;
}

export const BillingSubscriptionSection: FC<BillingSubscriptionSectionProps> = ({ subscription, onUpgrade }) => {
  const plan = subscription?.plan;
  const isActive = hasActivePlan(subscription);
  const isUsageBased = isUsageBasedPlan(plan);
  const hasCommitment = hasTwelveMonthCommitment(subscription);
  const { commitment } = useGetLatestSubscriptionCommitment(isActive && hasCommitment);
  const canChangePlan = isUpgradeMode(subscription);
  const { plans, allPlans, isPlansLoading } = useGetSubscriptionPlans(isActive && (isYearlyBilling(subscription) || canChangePlan));
  const hasHigherOffer = hasUpgradeTarget(subscription, allPlans);
  const { inProgressUpgrade, isInProgressUpgradeLoading } = useGetInProgressSubscriptionUpgrade(canChangePlan);
  const yearlyPricing = getYearlyPricing(
    subscription,
    plans.find(({ id }) => id === plan?.id)
  );
  const isAutomaticRenewal = commitment?.automaticRenewalStatus === EnableStatus.ENABLED;
  const billingIntervalLabel = getBillingIntervalLabel(subscription);
  const billingIntervalHint = getBillingIntervalHint(subscription);

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
            {hasCommitment && isAutomaticRenewal && (
              <Box>
                <Typography className='billing-label'>Renouvellement</Typography>
                <Typography className='billing-value'>Automatique</Typography>
                <Typography className='billing-hint'>Reconduit pour 12 mois à l’échéance</Typography>
              </Box>
            )}
          </Box>
          {canChangePlan && (
            <Box className='billing-row'>
              <Typography className='billing-hint'>{getChangePlanHint(!!inProgressUpgrade, isPlansLoading || hasHigherOffer)}</Typography>
              <Button
                variant='contained'
                className='billing-action'
                name='billing-upgrade-subscription'
                onClick={onUpgrade}
                disabled={isPlansLoading || isInProgressUpgradeLoading || (!inProgressUpgrade && !hasHigherOffer)}
              >
                {inProgressUpgrade ? 'Suivre mon changement d’offre' : 'Changer d’offre'}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box className='billing-row'>
          <Box className='billing-row-main'>
            <Typography className='billing-value'>{'Aucun abonnement actif'}</Typography>
            <Typography className='billing-hint'>{'Souscrivez à une offre pour débloquer tous les accès.'}</Typography>
          </Box>
          <Button variant='contained' className='billing-action' name='billing-choose-subscription' onClick={onUpgrade}>
            Choisir un abonnement
          </Button>
        </Box>
      )}
    </BillingSection>
  );
};
