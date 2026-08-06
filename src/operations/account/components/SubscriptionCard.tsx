import { SubscriptionModal } from '@/common/components';
import { useToggle } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { SubscriptionPlanDescription, UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useRecordContext } from 'react-admin';
import { SubscriptionInvoiceModal } from './SubscriptionInvoiceModal';
import { subscriptionFeatures } from './subscriptionFeatures';

const eurosFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const formatEuros = (cents: number) => `${eurosFormatter.format(cents / 100)} €`;

const isUsageBased = (plan?: SubscriptionPlanDescription) => plan?.billingType === 'USAGE_BASED';

const getPriceCents = (plan?: SubscriptionPlanDescription) => plan?.priceInCentsWithoutVat ?? 4900;

const getPriceSuffix = (plan?: SubscriptionPlanDescription) => (isUsageBased(plan) ? '/ analyse' : '/ mois');

const getPriceHt = (plan?: SubscriptionPlanDescription) => (isUsageBased(plan) ? 'Prix HT · aucun abonnement' : 'HT · engagement annuel 12 mois');

const getYearlyLabel = (plan?: SubscriptionPlanDescription) => (isUsageBased(plan) ? '' : `${formatEuros(getPriceCents(plan) * 12)} HT / an`);

const getFeatures = (plan?: SubscriptionPlanDescription) => {
  const features = plan?.features ?? [];
  return features.length > 0 ? features : subscriptionFeatures.map(({ text }) => text);
};

const INACTIVE_SUBSCRIPTION_STATUSES: (UserSubscriptionStatus | undefined)[] = [UserSubscriptionStatus.EMPTY, UserSubscriptionStatus.CANCELLED];

export const SubscriptionCard = () => {
  const { value: isInvoiceModalOpen, handleOpen, handleClose } = useToggle();
  const { open: openDialog } = useDialog();
  const record = useRecordContext();
  const subscription = record?.user?.subscription as UserSubscription | undefined;
  const plan = subscription?.plan;
  const hasActiveSubscription = !!plan && !INACTIVE_SUBSCRIPTION_STATUSES.includes(subscription?.status);
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const subscriptionEnd = subscription?.end ? dayjs(subscription.end) : null;
  const remainingDays = subscriptionEnd ? subscriptionEnd.diff(dayjs(), 'day') : null;
  const features = getFeatures(plan);
  const yearlyLabel = getYearlyLabel(plan);

  const openSubscriptionModal = () => openDialog(<SubscriptionModal allowClose />, { maxWidth: 'lg', fullWidth: true }, true);

  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Box className='subscription-header'>
          <Typography className='subscription-title'>Mon abonnement</Typography>
          <Button variant='contained' className='export-invoice-action' name='open-subscription-invoice-modal' onClick={handleOpen}>
            Télécharger mes factures
          </Button>
        </Box>

        {hasActiveSubscription ? (
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
                {formatEuros(getPriceCents(plan))}
              </Typography>
              <Typography component='span' className='subscription-price-suffix'>
                {getPriceSuffix(plan)}
              </Typography>
            </Box>
            <Typography className='subscription-price-ht'>{getPriceHt(plan)}</Typography>
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
                <Typography className='subscription-empty-text'>
                  Votre abonnement est résilié.
                  {remainingDays !== null && remainingDays > 0 && (
                    <>
                      {' '}
                      Vous conservez l’accès pendant encore{' '}
                      <Box component='span' className='subscription-empty-strong'>
                        {remainingDays} jour{remainingDays > 1 ? 's' : ''}
                      </Box>
                      .
                    </>
                  )}{' '}
                  Choisissez une nouvelle offre pour continuer sans interruption.
                </Typography>
                {subscriptionEnd && (
                  <Typography className='subscription-empty-note'>
                    Les analyses supplémentaires seront débitées le{' '}
                    <Box component='span' className='subscription-empty-strong'>
                      {subscriptionEnd.format('DD/MM/YYYY')}
                    </Box>{' '}
                    avec votre abonnement.
                  </Typography>
                )}
              </>
            ) : (
              <Typography className='subscription-empty-text'>Vous n’avez pas d’abonnement actif.</Typography>
            )}
            <Button variant='contained' className='choose-subscription-action' name='open-subscription-modal' onClick={openSubscriptionModal}>
              Choisir un abonnement
            </Button>
          </Box>
        )}

        <SubscriptionInvoiceModal open={isInvoiceModalOpen} onClose={handleClose} />
      </CardContent>
    </Card>
  );
};
