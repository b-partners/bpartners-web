import { useDialog } from '@/common/store/dialog';
import { SubscriptionPlans } from '@/operations/account/components/SubscriptionPlans';
import { authProvider, getCached, userSubscriptionProvider } from '@/providers';
import { EnableStatus, SubscriptionPlan, UserSubscriptionStatus } from '@bpartners/typescript-client';
import { Alert, AlertTitle, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionConsentStep } from './SubscriptionConsentStep';
import { SubscriptionRedirectStep } from './SubscriptionRedirectStep';

type SubscriptionStep = 'PLAN' | 'CONSENT' | 'REDIRECT';

const mutationFn = async (subscriptionPlanIdentifier: string) => {
  const { redirectionUrl } = await userSubscriptionProvider.init(subscriptionPlanIdentifier);
  return redirectionUrl;
};

export const SubscriptionModal: FC<{ allowClose?: boolean }> = ({ allowClose = false }) => {
  const [step, setStep] = useState<SubscriptionStep>('PLAN');
  const [redirectionUrl, setRedirectionUrl] = useState<string>();
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const { close } = useDialog();
  const [searchParams] = useSearchParams();

  const {
    isPending,
    mutate,
    variables: pendingPlanId,
    error: subscriptionInitError,
  } = useMutation({
    mutationKey: ['subscription', 'modal'],
    mutationFn,
    onSuccess: url => {
      setRedirectionUrl(url);
      setStep('CONSENT');
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
  const today = dayjs();
  const subscription = whoami?.user?.subscription;
  const isCancelled = subscription?.status === UserSubscriptionStatus.CANCELLED;
  const remainingDays = subscription?.end ? dayjs(subscription.end).diff(today, 'day') : null;

  const onLogout = () => authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));

  const onSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id) {
      setSelectedPlanId(plan.id);
      mutate(plan.id);
    }
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
        {remainingDays !== null && remainingDays > 0 && (
          <p>
            {isCancelled ? (
              <>
                Votre abonnement est résilié. Vous conservez l'accès pendant encore{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {remainingDays} jour{remainingDays > 1 ? 's' : ''}
                </span>
                . Choisissez une nouvelle offre pour continuer sans interruption.
              </>
            ) : (
              <>
                Il vous reste{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {remainingDays} jour{remainingDays > 1 ? 's' : ''}
                </span>{' '}
                d'essai. Aucun prélèvement ne sera effectué avant la fin de votre période d'essai, et vous pouvez annuler à tout moment.
              </>
            )}
          </p>
        )}
        <SubscriptionPlans onSelectPlan={onSelectPlan} pendingPlanId={isPending ? pendingPlanId : undefined} />
      </DialogContent>
      <DialogActions>
        {allowClose && <BPButton onClick={() => close()} label='Plus tard' isLoading={isPending} />}
        {!allowClose && <BPButton onClick={onLogout} label='Se déconnecter' isLoading={isPending} />}
      </DialogActions>
    </>
  );
};
