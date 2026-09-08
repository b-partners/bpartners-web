import { useDialog } from '@/common/store/dialog';
import { BillingModalContent } from '@/operations/account/components/billing/BillingModalContent';
import { BillingModalStyle } from '@/operations/account/components/billing/style';
import { isSubscriptionMandatory } from '@/operations/account/components/billing/utils';
import { SubscriptionPlans } from '@/operations/account/components/SubscriptionPlans';
import { useGetDefaultPaymentMethod, useGetSubscriptionPlans } from '@/operations/account/queries';
import { authProvider, getCached, SubscriptionBillingInterval, userSubscriptionProvider } from '@/providers';
import { EnableStatus, SubscriptionPlan, UserSubscriptionStatus } from '@bpartners/typescript-client';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { Alert, AlertTitle, Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionFlowDialogStyle, SubscriptionPlanActionsStyle, SubscriptionPlansDialogStyle, SubscriptionPlanTitleStyle } from './style';
import { SubscriptionConsentStep } from './SubscriptionConsentStep';
import { SubscriptionRedirectStep } from './SubscriptionRedirectStep';

type SubscriptionStep = 'PLAN' | 'CONSENT' | 'REDIRECT';

const SUBSCRIPTION_DIALOG_PROPS = { maxWidth: 'lg', fullWidth: true } as const;

const AUTO_WIDTH = { width: 'auto' };

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
  const [redirectTitle, setRedirectTitle] = useState<string>();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();
  const [isComparing, setIsComparing] = useState(false);
  const { close, open: openDialog, setDialogProps } = useDialog();
  const [searchParams] = useSearchParams();
  const { plans } = useGetSubscriptionPlans();
  const canCompare = plans.some(plan => plan.comparisonEntries?.length);

  useEffect(() => {
    const isPlanStep = step === 'PLAN';
    setDialogProps({ maxWidth: isPlanStep ? 'lg' : 'sm', sx: isPlanStep ? SubscriptionPlansDialogStyle : SubscriptionFlowDialogStyle });
  }, [step, setDialogProps]);

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
    mutationFn: (automaticRenewalStatus: EnableStatus) => userSubscriptionProvider.saveCommitment(selectedPlan!.id!, automaticRenewalStatus),
    onSuccess: () => setStep('REDIRECT'),
  });

  const { isPending: isAddingCard, mutate: addCard } = useMutation({
    mutationKey: ['billing', 'paymentMethod'],
    mutationFn: () => userSubscriptionProvider.replacePaymentMethod(),
    onSuccess: ({ redirectionUrl }) => {
      if (!redirectionUrl) return;
      setRedirectionUrl(redirectionUrl);
      setRedirectTitle('Vous allez être redirigé vers Stripe pour enregistrer votre moyen de paiement');
      setStep('REDIRECT');
    },
  });

  const error = searchParams.get('stripeStatus') === 'error' || !!subscriptionInitError;
  const errorMessage = (subscriptionInitError as any)?.response?.data?.message;

  const whoami = getCached.whoami();
  const subscription = whoami?.user?.subscription;
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const { paymentMethod, isPaymentMethodLoading } = useGetDefaultPaymentMethod();
  const hasCard = !!paymentMethod?.card?.lastFourDigits;
  const canClose = allowClose && hasCard && !isSubscriptionMandatory(subscription);

  const onLogout = () => authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));

  const openBillingCredits = () => {
    const onCloseBilling = hasCard ? close : () => openDialog(<SubscriptionModal allowClose={allowClose} />, SUBSCRIPTION_DIALOG_PROPS, false);
    openDialog(
      <BillingModalContent onClose={onCloseBilling} subscription={subscription} focusCredits enforcePaymentMethod={!hasCard} onLogout={onLogout} />,
      BILLING_DIALOG_PROPS,
      hasCard
    );
  };

  const onSelectPlan = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => {
    if (!plan.id) return;
    if (isUsageBased(plan)) {
      openBillingCredits();
      return;
    }
    setSelectedPlan(plan);
    mutate({ subscriptionPlanIdentifier: plan.id, billingInterval, isConsentRequired: isConsentRequiredFor(plan, billingInterval) });
  };

  const onConsent = (automaticRenewalStatus: EnableStatus) => saveCommitment(automaticRenewalStatus);

  const onBackToPlans = () => setStep('PLAN');

  if (step === 'REDIRECT' && redirectionUrl) {
    return <SubscriptionRedirectStep redirectionUrl={redirectionUrl} title={redirectTitle} />;
  }

  if (step === 'CONSENT') {
    return <SubscriptionConsentStep plan={selectedPlan} onAccept={onConsent} onBack={onBackToPlans} isLoading={isSavingCommitment} />;
  }

  return (
    <>
      <DialogTitle className='subscription-step-title' sx={SubscriptionPlanTitleStyle}>
        <Box className='subscription-step-title-icon'>
          <WorkspacePremiumRoundedIcon />
        </Box>
        <Box className='subscription-step-title-text'>
          <Typography component='span' className='subscription-step-title-main'>
            {isComparing ? 'Comparatif détaillé' : "Choisissez l'offre qui vous correspond le mieux."}
          </Typography>
          {isComparing ? (
            <Typography component='span' className='subscription-step-title-hint'>
              Tous les métrés et fonctionnalités en un coup d'œil.
            </Typography>
          ) : (
            isCancelled && (
              <Typography component='span' className='subscription-step-title-hint'>
                Renouvelez votre abonnement pour reprendre votre activité sur la plateforme.
              </Typography>
            )
          )}
        </Box>
        {canCompare && (
          <Button
            className='subscription-compare-toggle'
            variant='outlined'
            onClick={() => setIsComparing(comparing => !comparing)}
            data-cy='compare-plans-toggle'
          >
            {isComparing ? 'Souscrire à une offre' : 'Comparer les offres'}
          </Button>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: 2.5, pt: 0.5, pb: 0 }}>
        {error && (
          <Alert severity='error' variant='filled' sx={{ mb: 2 }}>
            <AlertTitle>Une erreur s'est produite.</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        <SubscriptionPlans
          onSelectPlan={onSelectPlan}
          pendingPlanId={isPending ? pendingVariables?.subscriptionPlanIdentifier : undefined}
          isComparing={isComparing}
        />
      </DialogContent>
      <DialogActions className='subscription-step-actions' sx={SubscriptionPlanActionsStyle}>
        {!isPaymentMethodLoading && (
          <>
            {canClose && <BPButton className='subscription-step-button' style={AUTO_WIDTH} onClick={() => close()} label='Plus tard' isLoading={isPending} />}
            {!canClose && hasCard && !isComparing && (
              <BPButton className='subscription-step-button' style={AUTO_WIDTH} onClick={() => close()} label='Accéder à la plateforme' isLoading={isPending} />
            )}
            {!hasCard && (
              <>
                <Button className='subscription-step-button subscription-step-button--ghost' onClick={onLogout} disabled={isPending}>
                  Se déconnecter
                </Button>
                <BPButton
                  className='subscription-step-button'
                  style={AUTO_WIDTH}
                  onClick={() => addCard()}
                  label='Ajouter une carte'
                  isLoading={isAddingCard}
                />
              </>
            )}
          </>
        )}
      </DialogActions>
    </>
  );
};
