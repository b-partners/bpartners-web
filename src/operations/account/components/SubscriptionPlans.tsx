import { useGetSubscriptionPlans } from '@/operations/account/queries';
import { SubscriptionBillingInterval } from '@/providers';
import { SubscriptionPlan, SubscriptionPlanFeatureStyle } from '@bpartners/typescript-client';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Box, Button, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { FC, useLayoutEffect, useRef, useState } from 'react';
import { SubscriptionComparison } from './SubscriptionComparison';
import { SubscriptionPlansStyle } from './style';

const PLAN_ICONS = [AccessTimeRoundedIcon, ArrowCircleLeftOutlinedIcon, TrendingUpRoundedIcon, ShieldOutlinedIcon];

const DEFAULT_ANNUAL_DISCOUNT_PERCENT = 10;

const eurosFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const formatEuros = (cents?: number) => `${eurosFormatter.format((cents ?? 0) / 100)} €`;

const isUsageBased = (plan: SubscriptionPlan) => plan.billingType === 'USAGE_BASED';

const roundToEuros = (cents: number) => Math.round(cents / 100) * 100;

const toPercent = (value: number) => Math.min(Math.max(value > 100 ? value / 100 : value, 0), 100);

const getDiscountPercent = (plan: SubscriptionPlan) => {
  if (isUsageBased(plan)) return 0;
  return plan.annualDiscountPercent ? toPercent(plan.annualDiscountPercent) : DEFAULT_ANNUAL_DISCOUNT_PERCENT;
};

const applyDiscount = (plan: SubscriptionPlan, cents: number) => roundToEuros(cents * (1 - getDiscountPercent(plan) / 100));

const getFullYearlyCents = (plan: SubscriptionPlan) => (plan.priceInCentsWithoutVat ?? 0) * 12;

const getPlanBillingInterval = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => (isUsageBased(plan) ? 'MONTHLY' : billingInterval);

const getPriceHtLabel = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => {
  if (isUsageBased(plan)) return 'Prix HT · aucun abonnement';
  if (getPlanBillingInterval(plan, billingInterval) === 'YEARLY') return 'Prix HT · payé en une fois';
  return 'HT · engagement annuel 12 mois';
};

const getMainPriceCents = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => {
  if (isUsageBased(plan)) return plan.overageUnitPriceInCents ?? plan.priceInCentsWithoutVat;
  if (billingInterval === 'YEARLY') return applyDiscount(plan, plan.priceInCentsWithoutVat ?? 0);
  return plan.priceInCentsWithoutVat;
};

const getIncludedAnalyses = (plan: SubscriptionPlan) => plan.includedCreditsPerBillingPeriod ?? 0;

const getCtaLabel = (plan: SubscriptionPlan) => {
  if (plan.isMostChosen && plan.trialPeriodDays) return `Essayer ${plan.trialPeriodDays} jours sans engagement`;
  if (isUsageBased(plan)) return 'Acheter une analyse';
  return `Choisir ${plan.name ?? ''}`.trim();
};

const renderInlineText = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((chunk, chunkIndex) => (chunkIndex % 2 === 1 ? <strong key={chunkIndex}>{chunk}</strong> : chunk));

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  index: number;
  billingInterval: SubscriptionBillingInterval;
  onSelect?: (plan: SubscriptionPlan) => void;
  isPending?: boolean;
  disabled?: boolean;
}

const SubscriptionPlanCard: FC<SubscriptionPlanCardProps> = ({ plan, index, billingInterval, onSelect, isPending = false, disabled = false }) => {
  const featured = !!plan.isMostChosen;
  const PlanIcon = PLAN_ICONS[index % PLAN_ICONS.length];
  const isYearly = getPlanBillingInterval(plan, billingInterval) === 'YEARLY';
  const fullYearlyCents = getFullYearlyCents(plan);
  const discountedYearlyCents = applyDiscount(plan, fullYearlyCents);

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
          {formatEuros(getMainPriceCents(plan, billingInterval))}
        </Typography>
        <Typography component='span' className='plan-price-suffix'>
          {isUsageBased(plan) ? '/ analyse' : '/ mois'}
        </Typography>
      </Box>
      <Typography className='plan-price-ht'>{getPriceHtLabel(plan, billingInterval)}</Typography>
      <Typography className='plan-price-yearly'>
        {isUsageBased(plan) ? (
          ' '
        ) : isYearly ? (
          <>
            <strong>{formatEuros(discountedYearlyCents)}</strong>
            {` HT / an (économie ${formatEuros(fullYearlyCents - discountedYearlyCents)})`}
          </>
        ) : (
          `${formatEuros(fullYearlyCents)} HT / an`
        )}
      </Typography>

      <Box className='plan-included'>
        <Typography component='span' className='plan-included-num'>
          {isUsageBased(plan) ? 1 : getIncludedAnalyses(plan)}
        </Typography>
        <Typography component='span' className='plan-included-label'>
          {isUsageBased(plan) ? 'analyse à l’unité' : 'analyses toiture incluses / mois'}
        </Typography>
      </Box>

      <Button
        className={`plan-cta${featured ? '' : ' plan-cta--outline'}`}
        variant={featured ? 'contained' : 'outlined'}
        onClick={() => onSelect?.(plan)}
        disabled={disabled || isPending}
        startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : undefined}
      >
        {getCtaLabel(plan)}
      </Button>

      <Box className='plan-features'>
        {plan.inheritedFromPlanName && <Box className='plan-inherits'>{`Tout ${plan.inheritedFromPlanName}`}</Box>}
        {(plan.featureSections ?? []).map((section, sectionIndex) => (
          <Box key={sectionIndex} className='plan-feature-section'>
            {section.title && <Typography className='plan-feature-title'>{section.title}</Typography>}
            <Box component='ul' className='plan-feature-list'>
              {(section.items ?? []).map((item, itemIndex) => {
                const excluded = item.style === SubscriptionPlanFeatureStyle.EXCLUDED;
                return (
                  <Box
                    component='li'
                    key={itemIndex}
                    className={`plan-feature${item.style === SubscriptionPlanFeatureStyle.HIGHLIGHTED ? ' plan-feature--strong' : ''}${excluded ? ' plan-feature--excluded' : ''}`}
                  >
                    <Box component='span' className='plan-feature-check'>
                      {excluded ? <CloseRoundedIcon /> : <CheckRoundedIcon />}
                    </Box>
                    <Box component='span' className='plan-feature-text'>
                      {renderInlineText(item.text ?? '')}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => void;
  pendingPlanId?: string;
  isComparing?: boolean;
}

export const SubscriptionPlans: FC<SubscriptionPlansProps> = ({ onSelectPlan, pendingPlanId, isComparing = false }) => {
  const { plans, isPlansLoading, isPlansError } = useGetSubscriptionPlans();
  const [billingInterval, setBillingInterval] = useState<SubscriptionBillingInterval>('YEARLY');
  const contentRef = useRef<HTMLDivElement>(null);
  const [reservedHeight, setReservedHeight] = useState(0);

  useLayoutEffect(() => {
    const height = contentRef.current?.scrollHeight ?? 0;
    if (height > 0) setReservedHeight(previous => Math.max(previous, height));
  }, [isComparing, billingInterval, plans]);

  const onBillingIntervalChange = (_event: unknown, value: SubscriptionBillingInterval | null) => value && setBillingInterval(value);

  const onSelect = (plan: SubscriptionPlan) => onSelectPlan?.(plan, getPlanBillingInterval(plan, billingInterval));

  if (isPlansLoading) {
    return (
      <Box sx={SubscriptionPlansStyle}>
        <Box className='plans-state'>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (isPlansError) {
    return (
      <Box sx={SubscriptionPlansStyle}>
        <Typography className='plans-state'>Impossible de charger les offres pour le moment.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={SubscriptionPlansStyle} style={reservedHeight ? { minHeight: `${reservedHeight}px` } : undefined}>
      <Box className='plans-content' ref={contentRef}>
        {isComparing ? (
          <SubscriptionComparison plans={plans} />
        ) : (
          <>
            <Box className='plans-billing'>
              <ToggleButtonGroup className='plans-billing-group' exclusive size='small' value={billingInterval} onChange={onBillingIntervalChange}>
                <ToggleButton className='plans-billing-option' value='MONTHLY' data-cy='billing-interval-monthly'>
                  Mensuel
                </ToggleButton>
                <ToggleButton className='plans-billing-option' value='YEARLY' data-cy='billing-interval-yearly'>
                  Annuel
                  <Box component='span' className='plans-billing-badge'>{`−${DEFAULT_ANNUAL_DISCOUNT_PERCENT} %`}</Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {plans.map((plan, index) => (
              <SubscriptionPlanCard
                key={plan.id ?? index}
                plan={plan}
                index={index}
                billingInterval={billingInterval}
                onSelect={onSelect}
                isPending={!!pendingPlanId && pendingPlanId === plan.id}
                disabled={!!pendingPlanId}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};
