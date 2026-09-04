import { useDialog } from '@/common/store/dialog';
import { BillingModalContent } from '@/operations/account/components/billing/BillingModalContent';
import { BillingModalStyle } from '@/operations/account/components/billing/style';
import { hasSpendableCredits, isSubscriptionMandatory } from '@/operations/account/components/billing/utils';
import { useGetCreditBalance } from '@/operations/account/queries';
import { SubscriptionPlans } from '@/operations/account/components/SubscriptionPlans';
import { authProvider, getCached, SubscriptionBillingInterval, userSubscriptionProvider } from '@/providers';
import { EnableStatus, SubscriptionPlan, UserSubscriptionStatus } from '@bpartners/typescript-client';
import { Alert, AlertTitle, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionConsentStep } from './SubscriptionConsentStep';
import { SubscriptionRedirectStep } from './SubscriptionRedirectStep';

type SubscriptionStep = 'PLAN' | 'CONSENT' | 'REDIRECT';

const SUBSCRIPTION_DIALOG_PROPS = { maxWidth: 'lg', fullWidth: true } as const;

const BILLING_DIALOG_PROPS = { ...SUBSCRIPTION_DIALOG_PROPS, sx: BillingModalStyle } as const;

interface SubscriptionInitVariables {
  subscriptionPlanIdentifier: string;
  billingInterval: SubscriptionBillingInterval;
  isConsentRequired: boolean;
}

const isUsageBased = (plan: SubscriptionPlan) => plan.billingType === 'USAGE_BASED';

const isConsentRequiredFor = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => billingInterval === 'MONTHLY' && !isUsageBased(plan);

const mutationFn = async ({ subscriptionPlanIdentifier, billingInterval }: SubscriptionInitVariables) => {
  const { redirectionUrl } = await userSubscriptionProvider.init(subscriptionPlanIdentifier, billingInterval);
  return redirectionUrl;
};

export const SubscriptionModal: FC<{ allowClose?: boolean }> = ({ allowClose = false }) => {
  const [step, setStep] = useState<SubscriptionStep>('PLAN');
  const [redirectionUrl, setRedirectionUrl] = useState<string>();
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const { close, open: openDialog } = useDialog();
  const [searchParams] = useSearchParams();

  const {
    isPending,
    mutate,
    variables: pendingVariables,
    error: subscriptionInitError,
  } = useMutation({
    mutationKey: ['subscription', 'modal'],
    mutationFn,
    onSuccess: (url, { isConsentRequired }) => {
      setRedirectionUrl(url);
      setStep(isConsentRequired ? 'CONSENT' : 'REDIRECT');
    },
  });

  const { isPending: isSavingCommitment, mutate: saveCommitment } = useMutation({
    mutationKey: ['subscription', 'commitment'],
    mutationFn: (automaticRenewalStatus: EnableStatus) => userSubscriptionProvider.saveCommitment(selectedPlanId!, automaticRenewalStatus),
    onSuccess: () => setStep('REDIRECT'),
  });

  const error = searchParams.get('stripeStatus') === 'error' || !!subscriptionInitError;
  const errorMessage = (subscriptionInitError as any)?.response?.data?.message;

  const whoami = getCached.whoami();
  const subscription = whoami?.user?.subscription;
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const { balance } = useGetCreditBalance();
  const hasCredits = hasSpendableCredits(balance);
  const canClose = allowClose && !isSubscriptionMandatory(subscription);

  const onLogout = () => authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));

  const openBillingCredits = () => {
    const canReachPlatform = canClose || hasCredits;
    const onCloseBilling = canReachPlatform ? close : () => openDialog(<SubscriptionModal />, SUBSCRIPTION_DIALOG_PROPS, false);
    openDialog(
      <BillingModalContent onClose={onCloseBilling} subscription={subscription} focusCredits enforceCredits={!canReachPlatform} onLogout={onLogout} />,
      BILLING_DIALOG_PROPS,
      canReachPlatform
    );
  };

  const onSelectPlan = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => {
    if (!plan.id) return;
    if (isUsageBased(plan)) {
      openBillingCredits();
      return;
    }
    setSelectedPlanId(plan.id);
    mutate({ subscriptionPlanIdentifier: plan.id, billingInterval, isConsentRequired: isConsentRequiredFor(plan, billingInterval) });
  };

  const onConsent = (automaticRenewalStatus: EnableStatus) => saveCommitment(automaticRenewalStatus);

  const onBackToPlans = () => setStep('PLAN');

  if (step === 'REDIRECT' && redirectionUrl) {
    return <SubscriptionRedirectStep redirectionUrl={redirectionUrl} />;
  }

  if (step === 'CONSENT') {
    return <SubscriptionConsentStep onAccept={onConsent} onBack={onBackToPlans} isLoading={isSavingCommitment} />;
  }

  return (
    <>
      <DialogTitle sx={{ py: 1.5 }}>Choisissez l'offre qui vous convient</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity='error' variant='filled' sx={{ mb: 2 }}>
            <AlertTitle>Une erreur s'est produite.</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {isCancelled && <p>Renouveler votre abonnement, choisissez l'offre qui vous correspond le mieux.</p>}
        <SubscriptionPlans onSelectPlan={onSelectPlan} pendingPlanId={isPending ? pendingVariables?.subscriptionPlanIdentifier : undefined} />
      </DialogContent>
      <DialogActions>
        {canClose && <BPButton onClick={() => close()} label='Plus tard' isLoading={isPending} />}
        {!canClose && hasCredits && <BPButton onClick={() => close()} label='Accéder à la plateforme' isLoading={isPending} />}
        {!canClose && !hasCredits && <BPButton onClick={onLogout} label='Se déconnecter' isLoading={isPending} />}
      </DialogActions>
    </>
  );
};
