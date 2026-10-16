import { formatDate, formatEuros } from '@/operations/account/components/billing/utils';
import { useGetSubscriptionPlans } from '@/operations/account/queries';
import { BillingInterval, SubscriptionPlan, SubscriptionUpgrade, SubscriptionUpgradeLineKind, SubscriptionUpgradeStatus } from '@bpartners/typescript-client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { FC } from 'react';
import { SubscriptionUpgradeSummaryStyle } from './style';

const AMOUNT_LABELS: Partial<Record<SubscriptionUpgradeStatus, string>> = {
  [SubscriptionUpgradeStatus.PENDING]: 'Montant à régler maintenant',
  [SubscriptionUpgradeStatus.AWAITING_PAYMENT]: 'Montant à régler maintenant',
  [SubscriptionUpgradeStatus.PAID]: 'Montant débité',
  [SubscriptionUpgradeStatus.INVOICED]: 'Montant débité',
};

const isYearly = (interval?: BillingInterval) => interval === BillingInterval.YEARLY;

const getPriceWithoutVat = (plan: SubscriptionPlan | undefined, interval?: BillingInterval) => {
  if (!plan) return undefined;
  if (isYearly(interval)) return plan.annualPriceInCentsWithoutVat ?? (plan.priceInCentsWithoutVat ?? 0) * 12;
  return plan.priceInCentsWithoutVat;
};

const getPriceWithVat = (plan: SubscriptionPlan | undefined, interval?: BillingInterval) => {
  if (!plan) return undefined;
  if (isYearly(interval)) return plan.annualPriceInCentsWithVat;
  return plan.priceInCentsWithVat;
};

const getIntervalLabel = (interval?: BillingInterval) => (isYearly(interval) ? 'Paiement annuel · payé en une fois' : 'Paiement mensuel · engagement 12 mois');

const COMMITMENT_MONTHS = 12;

const formatMonth = (date: dayjs.Dayjs) => date.locale('fr').format('MMMM YYYY');

const formatCommitmentPeriod = (upgradeDatetime?: Date) => {
  const start = dayjs(upgradeDatetime ?? undefined).startOf('month');
  return `${formatMonth(start)} à ${formatMonth(start.add(COMMITMENT_MONTHS - 1, 'month'))}`;
};

const formatNextBillingDate = (upgradeDatetime?: Date) =>
  dayjs(upgradeDatetime ?? undefined)
    .add(1, 'month')
    .startOf('month')
    .locale('fr')
    .format('D MMMM YYYY');

interface UpgradePlanCardProps {
  label: string;
  plan?: SubscriptionPlan;
  interval?: BillingInterval;
  isNext?: boolean;
}

const UpgradePlanCard: FC<UpgradePlanCardProps> = ({ label, plan, interval, isNext = false }) => {
  const priceWithoutVat = getPriceWithoutVat(plan, interval);
  const priceWithVat = getPriceWithVat(plan, interval);
  const period = isYearly(interval) ? 'an' : 'mois';

  return (
    <Box className={`summary-plan${isNext ? ' summary-plan--next' : ''}`}>
      <Typography className='summary-plan-label'>{label}</Typography>
      <Typography className='summary-plan-name'>{plan?.name ?? '—'}</Typography>
      {priceWithoutVat !== undefined && <Typography className='summary-plan-price'>{`${formatEuros(priceWithoutVat)} HT / ${period}`}</Typography>}
      {!!priceWithVat && <Typography className='summary-plan-vat'>{`soit ${formatEuros(priceWithVat)} TTC / ${period}`}</Typography>}
      <Typography className='summary-plan-meta'>{getIntervalLabel(interval)}</Typography>
      {!!plan?.includedCreditsPerBillingPeriod && (
        <Typography className='summary-plan-meta'>{`${plan.includedCreditsPerBillingPeriod} analyses toiture incluses / mois`}</Typography>
      )}
    </Box>
  );
};

const formatPeriod = (start?: string, end?: string) => (start && end ? `du ${formatDate(start)} au ${formatDate(end)}` : '');

const sumLines = (upgrade: SubscriptionUpgrade, kind: SubscriptionUpgradeLineKind) =>
  (upgrade.lines ?? []).filter(line => line.kind === kind).reduce((total, line) => total + (line.amountInCentsWithVat ?? 0), 0);

const getNewChargeCents = (upgrade: SubscriptionUpgrade) =>
  upgrade.newChargeInCentsWithVat ?? (upgrade.lines?.length ? sumLines(upgrade, SubscriptionUpgradeLineKind.NEW_CHARGE) : undefined);

const getCreditCents = (upgrade: SubscriptionUpgrade) =>
  upgrade.creditedInCentsWithVat ??
  upgrade.currentSubscriptionCredit?.remainingAmountInCentsWithVat ??
  (upgrade.lines?.length ? sumLines(upgrade, SubscriptionUpgradeLineKind.CREDIT) : undefined);

const getChargePeriod = (upgrade: SubscriptionUpgrade) => {
  const chargeLines = (upgrade.lines ?? []).filter(line => line.kind === SubscriptionUpgradeLineKind.NEW_CHARGE);
  const starts = chargeLines.map(({ periodStart }) => periodStart).filter((date): date is string => !!date);
  const ends = chargeLines.map(({ periodEnd }) => periodEnd).filter((date): date is string => !!date);
  return {
    start: starts.sort()[0],
    end: ends.sort()[ends.length - 1] ?? upgrade.currentSubscriptionCredit?.remainingPeriodEnd,
  };
};

interface SummaryRow {
  key: string;
  label: string;
  detail?: string;
  value: string;
  isCredit?: boolean;
}

interface SubscriptionUpgradeSummaryProps {
  upgrade: SubscriptionUpgrade;
}

export const SubscriptionUpgradeSummary: FC<SubscriptionUpgradeSummaryProps> = ({ upgrade }) => {
  const { allPlans } = useGetSubscriptionPlans();
  const { status, fromSubscriptionPlanIdentifier, toSubscriptionPlanIdentifier, fromBillingInterval, toBillingInterval } = upgrade;
  const { prorationAmountInCentsWithVat, upgradeDatetime, currentSubscriptionCredit: credit } = upgrade;
  const fromPlan = allPlans.find(({ id }) => id === fromSubscriptionPlanIdentifier);
  const toPlan = allPlans.find(({ id }) => id === toSubscriptionPlanIdentifier);
  const isMonthlyTarget = !isYearly(toBillingInterval);
  const hasAmount = prorationAmountInCentsWithVat !== undefined;
  const nextMonthlyPrice = getPriceWithVat(toPlan, toBillingInterval);
  const newChargeCents = getNewChargeCents(upgrade);
  const creditCents = getCreditCents(upgrade);
  const remainingPeriod = formatPeriod(credit?.remainingPeriodStart, credit?.remainingPeriodEnd);
  const { start: chargeStart, end: chargeEnd } = getChargePeriod(upgrade);
  const periodEndLabel = isYearly(fromBillingInterval) ? 'fin de votre engagement annuel' : 'fin du mois en cours';
  const hasBreakdown = newChargeCents !== undefined && creditCents !== undefined;

  const rows: SummaryRow[] = hasBreakdown
    ? [
        {
          key: 'charge',
          label: `Prorata de ${toPlan?.name ?? 'la nouvelle offre'}${chargeEnd ? ` jusqu’au ${formatDate(chargeEnd)}` : ''}`,
          detail: `${chargeStart ? `Du ${formatDate(chargeStart)}, jour de la bascule, ` : 'Depuis aujourd’hui, '}jusqu’à la ${periodEndLabel}`,
          value: formatEuros(newChargeCents),
        },
        {
          key: 'credit',
          label: `Réduction : reste de l’offre ${fromPlan?.name ?? 'actuelle'} déjà payée`,
          detail: `Période payée mais non consommée${remainingPeriod ? `, ${remainingPeriod}` : ''}`,
          value: `− ${formatEuros(creditCents)}`,
          isCredit: true,
        },
      ]
    : [];

  return (
    <Box sx={SubscriptionUpgradeSummaryStyle} data-cy='subscription-upgrade-summary'>
      <Box className='summary-plans'>
        <UpgradePlanCard label='Offre actuelle' plan={fromPlan} interval={fromBillingInterval} />
        <Box className='summary-arrow'>
          <ArrowForwardRoundedIcon />
        </Box>
        <UpgradePlanCard label='Nouvelle offre' plan={toPlan} interval={toBillingInterval} isNext />
      </Box>

      <Box className='summary-amount'>
        {hasBreakdown && (
          <Typography className='summary-why'>
            {`Vous ne payez pas le prix complet de la nouvelle offre : vous avez déjà réglé votre offre actuelle, et la période payée mais non consommée${
              remainingPeriod ? ` (${remainingPeriod})` : ''
            } est déduite.`}
          </Typography>
        )}
        {!!rows.length && (
          <Box className='summary-calculation' data-cy='subscription-upgrade-calculation'>
            {rows.map(({ key, label, detail, value, isCredit }) => (
              <Box key={key} className={`summary-calculation-row${isCredit ? ' summary-calculation-row--credit' : ''}`}>
                <Box className='summary-calculation-text'>
                  <Typography className='summary-calculation-label'>{label}</Typography>
                  {!!detail && <Typography className='summary-calculation-detail'>{detail}</Typography>}
                </Box>
                <Typography className='summary-calculation-amount'>{value}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {hasAmount && (
          <Box className='summary-amount-header'>
            <Typography className='summary-amount-label'>{AMOUNT_LABELS[status as SubscriptionUpgradeStatus] ?? 'Montant du changement d’offre'}</Typography>
            <Typography component='span' className='summary-amount-value'>
              {formatEuros(prorationAmountInCentsWithVat)}
              <Typography component='span' className='summary-amount-vat'>
                TTC
              </Typography>
            </Typography>
          </Box>
        )}
        <Box component='ul' className='summary-explanations'>
          {isMonthlyTarget && !!nextMonthlyPrice && (
            <Box component='li' className='summary-explanation'>
              <InfoOutlinedIcon />
              <span>{`Ensuite, ${formatEuros(nextMonthlyPrice)} TTC par mois à partir du ${formatNextBillingDate(upgradeDatetime)}.`}</span>
            </Box>
          )}
          <Box component='li' className='summary-explanation'>
            <InfoOutlinedIcon />
            <span>{`Engagement renouvelé pour 12 mois, mois complets : ${formatCommitmentPeriod(upgradeDatetime)}.`}</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
