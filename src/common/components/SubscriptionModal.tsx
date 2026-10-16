import { useDialog } from '@/common/store/dialog';
import { getAppBaseUrl } from '@/common/utils';
import { BillingModalContent } from '@/operations/account/components/billing/BillingModalContent';
import { BillingModalStyle } from '@/operations/account/components/billing/style';
import { isSubscriptionMandatory, isUpgradeMode } from '@/operations/account/components/billing/utils';
import { SubscriptionPlans } from '@/operations/account/components/SubscriptionPlans';
import {
  SUBSCRIPTION_UPGRADE_QUERY_KEY,
  useGetDefaultPaymentMethod,
  useGetInProgressSubscriptionUpgrade,
  useGetSubscriptionPlans,
} from '@/operations/account/queries';
import { authProvider, cache, getCached, profileProvider, SubscriptionBillingInterval, userSubscriptionProvider } from '@/providers';
import { EnableStatus, SubscriptionPlan, SubscriptionUpgrade, SubscriptionUpgradeStatus, UserSubscriptionStatus } from '@bpartners/typescript-client';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { Alert, AlertTitle, Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useLayoutEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';
import {
  SubscriptionFlowDialogStyle,
  SubscriptionPlanActionsStyle,
  SubscriptionPlansDialogStyle,
  SubscriptionPlanTitleStyle,
  SubscriptionUpgradeDialogStyle,
  SubscriptionUpgradeLoadingStyle,
} from './style';
import { SubscriptionConsentStep } from './SubscriptionConsentStep';
import { SubscriptionRedirectStep } from './SubscriptionRedirectStep';
import { SubscriptionTrialStep } from './SubscriptionTrialStep';
import { SubscriptionUpgradeConfirmStep } from './SubscriptionUpgradeConfirmStep';
import { SubscriptionUpgradeStep } from './SubscriptionUpgradeStep';

type SubscriptionStep = 'PLAN' | 'TRIAL' | 'CONSENT' | 'REDIRECT' | 'UPGRADE_CONFIRM' | 'UPGRADE';

const SUBSCRIPTION_DIALOG_PROPS = { maxWidth: 'lg', fullWidth: true } as const;

const AUTO_WIDTH = { width: 'auto' };

const BILLING_DIALOG_PROPS = { ...SUBSCRIPTION_DIALOG_PROPS, sx: BillingModalStyle } as const;

interface SubscriptionInitVariables {
  subscriptionPlanIdentifier: string;
  billingInterval: SubscriptionBillingInterval;
  isConsentRequired: boolean;
}

const SWITCHED_UPGRADE_STATUSES: (SubscriptionUpgradeStatus | undefined)[] = [SubscriptionUpgradeStatus.PAID, SubscriptionUpgradeStatus.INVOICED];

const isUsageBased = (plan: SubscriptionPlan) => plan.billingType === 'USAGE_BASED';

const isConsentRequiredFor = (plan: SubscriptionPlan, billingInterval: SubscriptionBillingInterval) => billingInterval === 'MONTHLY' && !isUsageBased(plan);

const mutationFn = async ({ subscriptionPlanIdentifier, billingInterval }: SubscriptionInitVariables) => {
  const { redirectionUrl } = await userSubscriptionProvider.init(subscriptionPlanIdentifier, billingInterval);
  return redirectionUrl;
};

const refreshCachedUser = async () => {
  const cachedWhoami = getCached.whoami();
  const userId = cachedWhoami?.user?.id;
  if (!userId) return undefined;
  const freshUser = await profileProvider.getOne(userId).catch(() => undefined);
  if (freshUser) cache.whoami({ ...cachedWhoami, user: freshUser });
  return userId;
};

export const SubscriptionModal: FC<{ allowClose?: boolean }> = ({ allowClose = false }) => {
  const [step, setStep] = useState<SubscriptionStep>('PLAN');
  const [redirectionUrl, setRedirectionUrl] = useState<string>();
  const [redirectTitle, setRedirectTitle] = useState<string>();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();
  const [upgrade, setUpgrade] = useState<SubscriptionUpgrade>();
  const [isChargeFailed, setIsChargeFailed] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const { close, open: openDialog, setDialogProps } = useDialog();
  const [searchParams] = useSearchParams();
  const { plans } = useGetSubscriptionPlans();
  const queryClient = useQueryClient();
  const canCompare = plans.some(plan => plan.comparisonEntries?.length);

  const applyStepDialogProps = (nextStep: SubscriptionStep) => {
    const isPlanStep = nextStep === 'PLAN';
    const flowStyle = nextStep === 'UPGRADE' || nextStep === 'UPGRADE_CONFIRM' ? SubscriptionUpgradeDialogStyle : SubscriptionFlowDialogStyle;
    setDialogProps({ maxWidth: isPlanStep ? 'lg' : 'sm', sx: isPlanStep ? SubscriptionPlansDialogStyle : flowStyle });
  };

  const goToStep = (nextStep: SubscriptionStep) => {
    applyStepDialogProps(nextStep);
    setStep(nextStep);
  };

  const redirectToUpgradePayment = (paymentUrl: string) => {
    setRedirectionUrl(paymentUrl);
    setRedirectTitle('Vous allez être redirigé vers Stripe pour finaliser le paiement de votre changement d’offre');
    goToStep('REDIRECT');
  };

  useLayoutEffect(() => {
    setDialogProps({ maxWidth: 'lg', sx: SubscriptionPlansDialogStyle });
  }, [setDialogProps]);

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
      goToStep(isConsentRequired ? 'CONSENT' : 'REDIRECT');
    },
  });

  const {
    isPending: isStartingUpgrade,
    mutate: startUpgrade,
    variables: startingUpgradeVariables,
    error: startUpgradeError,
  } = useMutation({
    mutationKey: ['subscription', 'upgrade', 'start'],
    mutationFn: ({ subscriptionPlanIdentifier, billingInterval }: Omit<SubscriptionInitVariables, 'isConsentRequired'>) =>
      userSubscriptionProvider.startUpgrade(subscriptionPlanIdentifier, billingInterval),
    onSuccess: result => {
      setIsChargeFailed(false);
      setUpgrade(result);
      goToStep(result.status === SubscriptionUpgradeStatus.PENDING ? 'UPGRADE_CONFIRM' : 'UPGRADE');
    },
  });

  const {
    isPending: isConfirmingUpgrade,
    mutate: confirmUpgrade,
    error: confirmUpgradeError,
  } = useMutation({
    mutationKey: ['subscription', 'upgrade', 'confirm'],
    mutationFn: (upgradeId: string) => userSubscriptionProvider.confirmUpgrade(upgradeId),
    onSuccess: async result => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_UPGRADE_QUERY_KEY });
      if (result.status === SubscriptionUpgradeStatus.PENDING) {
        setUpgrade(result);
        setIsChargeFailed(true);
        return;
      }
      if (SWITCHED_UPGRADE_STATUSES.includes(result.status)) {
        await refreshCachedUser();
        setUpgrade(result);
        goToStep('UPGRADE');
        return;
      }
      if (result.paymentUrl) {
        redirectToUpgradePayment(result.paymentUrl);
        return;
      }
      setUpgrade(result);
      goToStep('UPGRADE');
    },
  });

  const { isPending: isAbandoningUpgrade, mutate: abandonUpgrade } = useMutation({
    mutationKey: ['subscription', 'upgrade', 'abandon'],
    mutationFn: (upgradeId: string) => userSubscriptionProvider.abandonUpgrade(upgradeId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_UPGRADE_QUERY_KEY });
      setUpgrade(undefined);
      goToStep('PLAN');
    },
  });

  const {
    isPending: isStartingTrial,
    mutate: startTrial,
    variables: startingTrialPlanId,
  } = useMutation({
    mutationKey: ['subscription', 'trial'],
    mutationFn: (subscriptionPlanIdentifier: string) => userSubscriptionProvider.startTrial(subscriptionPlanIdentifier),
    onSuccess: async () => {
      const userId = await refreshCachedUser();
      if (!userId) return;
      Redirect.toURL(`${getAppBaseUrl()}/account/${userId}?trialStarted=done`);
    },
  });

  const { isPending: isAddingTrialCard, mutate: addTrialCard } = useMutation({
    mutationKey: ['subscription', 'trial', 'card'],
    mutationFn: () => userSubscriptionProvider.initiateTrialPaymentMethod(),
    onSuccess: ({ redirectionUrl }) => {
      if (!redirectionUrl) return;
      setRedirectionUrl(redirectionUrl);
      setRedirectTitle('Vous allez être redirigé vers Stripe pour enregistrer votre carte. Aucun débit ne sera effectué pendant votre essai.');
      goToStep('REDIRECT');
    },
  });

  const { isPending: isSavingCommitment, mutate: saveCommitment } = useMutation({
    mutationKey: ['subscription', 'commitment'],
    mutationFn: (automaticRenewalStatus: EnableStatus) => userSubscriptionProvider.saveCommitment(selectedPlan!.id!, automaticRenewalStatus),
    onSuccess: () => goToStep('REDIRECT'),
  });

  const { isPending: isAddingCard, mutate: addCard } = useMutation({
    mutationKey: ['billing', 'paymentMethod'],
    mutationFn: () => userSubscriptionProvider.replacePaymentMethod(),
    onSuccess: ({ redirectionUrl }) => {
      if (!redirectionUrl) return;
      setRedirectionUrl(redirectionUrl);
      setRedirectTitle('Vous allez être redirigé vers Stripe pour enregistrer votre moyen de paiement');
      goToStep('REDIRECT');
    },
  });

  const requestError = subscriptionInitError ?? startUpgradeError;
  const error = searchParams.get('stripeStatus') === 'error' || !!requestError;
  const errorMessage = (requestError as any)?.response?.data?.message;
  const confirmErrorMessage = (confirmUpgradeError as any)?.response?.data?.message;

  const whoami = getCached.whoami();
  const subscription = whoami?.user?.subscription;
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const { paymentMethod, isPaymentMethodLoading } = useGetDefaultPaymentMethod();
  const hasCard = !!paymentMethod?.card?.lastFourDigits;
  const canClose = allowClose && hasCard && !isSubscriptionMandatory(subscription);

  const isUpgrade = isUpgradeMode(subscription);
  const { inProgressUpgrade, isInProgressUpgradeLoading } = useGetInProgressSubscriptionUpgrade(isUpgrade);

  useEffect(() => {
    if (!inProgressUpgrade || step !== 'PLAN') return;
    setUpgrade(inProgressUpgrade);
    goToStep('UPGRADE');
  }, [inProgressUpgrade]);

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
    if (isUpgrade) {
      startUpgrade({ subscriptionPlanIdentifier: plan.id, billingInterval });
      return;
    }
    mutate({ subscriptionPlanIdentifier: plan.id, billingInterval, isConsentRequired: isConsentRequiredFor(plan, billingInterval) });
  };

  const onStartTrial = (plan: SubscriptionPlan) => {
    if (!plan.id) return;
    setSelectedPlan(plan);
    goToStep('TRIAL');
  };

  const onConfirmTrial = () => selectedPlan?.id && startTrial(selectedPlan.id);

  const onAddTrialCard = () => {
    if (selectedPlan?.id) cache.pendingTrialPlan(selectedPlan.id);
    addTrialCard();
  };

  const onConsent = (automaticRenewalStatus: EnableStatus) => saveCommitment(automaticRenewalStatus);

  const onBackToPlans = () => goToStep('PLAN');

  const onConfirmUpgrade = () => upgrade?.id && confirmUpgrade(upgrade.id);

  const onAbandonUpgrade = () => upgrade?.id && abandonUpgrade(upgrade.id);

  const onUpgradeDone = () => {
    const userId = getCached.whoami()?.user?.id;
    if (userId) Redirect.toURL(`${getAppBaseUrl()}/account/${userId}`);
    else close();
  };

  if (step === 'REDIRECT' && redirectionUrl) {
    return <SubscriptionRedirectStep redirectionUrl={redirectionUrl} title={redirectTitle} />;
  }

  if (step === 'PLAN' && isUpgrade && isInProgressUpgradeLoading) {
    return (
      <DialogContent>
        <Box sx={SubscriptionUpgradeLoadingStyle}>
          <CircularProgress />
        </Box>
      </DialogContent>
    );
  }

  if (step === 'UPGRADE_CONFIRM' && upgrade) {
    return (
      <SubscriptionUpgradeConfirmStep
        upgrade={upgrade}
        onAbandon={onAbandonUpgrade}
        onConfirm={onConfirmUpgrade}
        isConfirming={isConfirmingUpgrade}
        isAbandoning={isAbandoningUpgrade}
        isChargeFailed={isChargeFailed}
        hasError={!!confirmUpgradeError}
        errorMessage={confirmErrorMessage}
      />
    );
  }

  if (step === 'UPGRADE' && upgrade) {
    return (
      <SubscriptionUpgradeStep
        upgrade={upgrade}
        onBackToPlans={onBackToPlans}
        onDone={onUpgradeDone}
        onPay={redirectToUpgradePayment}
        onAbandon={onAbandonUpgrade}
        isAbandoning={isAbandoningUpgrade}
      />
    );
  }

  if (step === 'TRIAL') {
    return (
      <SubscriptionTrialStep
        plan={selectedPlan}
        hasCard={hasCard}
        onConfirm={onConfirmTrial}
        onAddCard={onAddTrialCard}
        onBack={onBackToPlans}
        isLoading={isStartingTrial || isAddingTrialCard}
      />
    );
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
          onStartTrial={onStartTrial}
          pendingPlanId={
            isPending ? pendingVariables?.subscriptionPlanIdentifier : isStartingUpgrade ? startingUpgradeVariables?.subscriptionPlanIdentifier : undefined
          }
          pendingTrialPlanId={isStartingTrial ? startingTrialPlanId : undefined}
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
