import { useToggle } from '@/common/hooks';
import { SubscriptionPlanDescription, UserSubscription } from '@bpartners/typescript-client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
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

export const SubscriptionCard = () => {
  const { value: isInvoiceModalOpen, handleOpen, handleClose } = useToggle();
  const record = useRecordContext();
  const plan = (record?.user?.subscription as UserSubscription | undefined)?.plan;
  const features = getFeatures(plan);
  const yearlyLabel = getYearlyLabel(plan);

  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Box className='subscription-header'>
          <Typography className='subscription-title'>Mon abonnement</Typography>
          <Button variant='contained' className='export-invoice-action' name='open-subscription-invoice-modal' onClick={handleOpen}>
            Télécharger mes factures
          </Button>
        </Box>

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

        <SubscriptionInvoiceModal open={isInvoiceModalOpen} onClose={handleClose} />
      </CardContent>
    </Card>
  );
};
