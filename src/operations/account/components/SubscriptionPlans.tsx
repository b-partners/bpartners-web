import { useGetSubscriptionPlans } from '@/operations/account/queries';
import { SubscriptionPlan } from '@bpartners/typescript-client';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { FC } from 'react';
import { SubscriptionPlansStyle } from './style';

const PLAN_ICONS = [AccessTimeRoundedIcon, ArrowCircleLeftOutlinedIcon, TrendingUpRoundedIcon, ShieldOutlinedIcon];

const eurosFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const formatEuros = (cents?: number) => `${eurosFormatter.format((cents ?? 0) / 100)} €`;

const isUsageBased = (plan: SubscriptionPlan) => plan.billingType === 'USAGE_BASED';

const getMainPriceCents = (plan: SubscriptionPlan) => {
  if (isUsageBased(plan)) return plan.overageUnitPriceInCents ?? plan.priceInCentsWithoutVat;
  return plan.priceInCentsWithoutVat;
};

const getYearlyLabel = (plan: SubscriptionPlan) => {
  if (isUsageBased(plan)) return '';
  const yearlyCents = (plan.priceInCentsWithoutVat ?? 0) * 12;
  return `${formatEuros(yearlyCents)} HT / an`;
};

const getCtaLabel = (plan: SubscriptionPlan) => {
  if (plan.isMostChosen && plan.trialPeriodDays) return `Essayer ${plan.trialPeriodDays} jours sans engagement`;
  if (isUsageBased(plan)) return 'Acheter une analyse';
  return `Choisir ${plan.name ?? ''}`.trim();
};

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  index: number;
  onSelect?: (plan: SubscriptionPlan) => void;
  isPending?: boolean;
  disabled?: boolean;
}

const SubscriptionPlanCard: FC<SubscriptionPlanCardProps> = ({ plan, index, onSelect, isPending = false, disabled = false }) => {
  const featured = !!plan.isMostChosen;
  const yearlyLabel = getYearlyLabel(plan);
  const PlanIcon = PLAN_ICONS[index % PLAN_ICONS.length];

  return (
    <Box className={`plan-card${featured ? ' plan-card--featured' : ''}`}>
      {featured && <Box className='plan-badge'>Le plus choisi</Box>}
      <Box className='plan-icon'>
        <PlanIcon />
      </Box>
      <Typography className='plan-name'>{plan.name}</Typography>
      <Typography className='plan-subtitle'>{plan.description}</Typography>

      <Box className='plan-price-row'>
        <Typography component='span' className='plan-price'>
          {formatEuros(getMainPriceCents(plan))}
        </Typography>
        <Typography component='span' className='plan-price-suffix'>
          {isUsageBased(plan) ? '/ analyse' : '/ mois'}
        </Typography>
      </Box>
      <Typography className='plan-price-ht'>{isUsageBased(plan) ? 'Prix HT · aucun abonnement' : 'HT · engagement annuel 12 mois'}</Typography>
      <Typography className='plan-price-yearly'>{yearlyLabel || ' '}</Typography>

      <Button
        className={`plan-cta${featured ? '' : ' plan-cta--outline'}`}
        variant={featured ? 'contained' : 'outlined'}
        onClick={() => onSelect?.(plan)}
        disabled={disabled || isPending}
        startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : undefined}
      >
        {getCtaLabel(plan)}
      </Button>

      <Box component='ul' className='plan-features'>
        {(plan.features ?? []).map((feature, featureIndex) => (
          <Box component='li' key={featureIndex} className={`plan-feature${featureIndex === 0 ? ' plan-feature--strong' : ''}`}>
            <Box component='span' className='plan-feature-check'>
              <CheckRoundedIcon />
            </Box>
            {feature}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  pendingPlanId?: string;
}

export const SubscriptionPlans: FC<SubscriptionPlansProps> = ({ onSelectPlan, pendingPlanId }) => {
  const { plans, isPlansLoading, isPlansError } = useGetSubscriptionPlans();

  return (
    <Box sx={SubscriptionPlansStyle}>
      {isPlansLoading ? (
        <Box className='plans-state'>
          <CircularProgress />
        </Box>
      ) : isPlansError ? (
        <Typography className='plans-state'>Impossible de charger les offres pour le moment.</Typography>
      ) : (
        plans.map((plan, index) => (
          <SubscriptionPlanCard
            key={plan.id ?? index}
            plan={plan}
            index={index}
            onSelect={onSelectPlan}
            isPending={!!pendingPlanId && pendingPlanId === plan.id}
            disabled={!!pendingPlanId}
          />
        ))
      )}
    </Box>
  );
};
