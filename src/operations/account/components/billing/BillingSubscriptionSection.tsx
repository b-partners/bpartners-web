import { useGetOngoingSubscriptionCommitment } from '@/operations/account/queries';
import { EnableStatus, UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, Typography } from '@mui/material';
import { FC } from 'react';
import { BillingSection } from './BillingSection';
import { formatDate, formatEuros, getBillingIntervalHint, getBillingIntervalLabel, getCommitmentEndLabel, hasActivePlan, isUsageBasedPlan } from './utils';

interface BillingSubscriptionSectionProps {
  subscription?: UserSubscription;
  onUpgrade: () => void;
}

export const BillingSubscriptionSection: FC<BillingSubscriptionSectionProps> = ({ subscription, onUpgrade }) => {
  const plan = subscription?.plan;
  const isActive = hasActivePlan(subscription);
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const isUsageBased = isUsageBasedPlan(plan);
  const { commitment, isCommitmentUnknown } = useGetOngoingSubscriptionCommitment(isActive && !isUsageBased);
  const isAutomaticRenewal = commitment?.automaticRenewalStatus === EnableStatus.ENABLED;
  const billingIntervalLabel = getBillingIntervalLabel(subscription, commitment, isCommitmentUnknown);
  const billingIntervalHint = getBillingIntervalHint(subscription, commitment, isCommitmentUnknown);

  const getInactiveHint = () => {
    if (!isCancelled) return 'Souscrivez à une offre pour lancer vos analyses.';
    return subscription?.end ? `A pris fin le ${formatDate(subscription.end)}` : 'Aucun renouvellement prévu.';
  };

  const getRenewalHint = () => {
    if (isCancelled) return 'Aucun renouvellement, l’abonnement prend fin';
    if (isUsageBased) return 'Aucun renouvellement, facturé à chaque analyse';
    if (!subscription?.end) return 'Date de renouvellement indisponible';
    if (!commitment) return 'Fin de la période payée';
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
              <Typography className='billing-plan-price'>{formatEuros(plan?.priceInCentsWithoutVat)}</Typography>
              <Typography className='billing-hint'>{isUsageBased ? 'HT / analyse' : 'HT / mois'}</Typography>
            </Box>
            <Box>
              <Typography className='billing-label'>Paiement</Typography>
              <Typography className='billing-value'>{billingIntervalLabel}</Typography>
              <Typography className='billing-hint'>{billingIntervalHint}</Typography>
            </Box>
            {!!commitment && (
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
