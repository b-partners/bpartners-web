import { BPButton } from '@/common/components/BPButton';
import { SubscriptionModal } from '@/common/components/SubscriptionModal';
import { SubscriptionRedirectStep } from '@/common/components/SubscriptionRedirectStep';
import { useDialog } from '@/common/store/dialog';
import { useGetDefaultPaymentMethod } from '@/operations/account/queries';
import { UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { Button, CircularProgress, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC, useState } from 'react';
import { BillingCancellationSection } from './BillingCancellationSection';
import { BillingCreditsSection } from './BillingCreditsSection';
import { BillingInvoicesSection } from './BillingInvoicesSection';
import { BillingPaymentMethodSection } from './BillingPaymentMethodSection';
import { BillingSubscriptionSection } from './BillingSubscriptionSection';
import { usePaymentMethodSync } from './use-payment-method-sync';
import { isSubscriptionMandatory } from './utils';

interface BillingRedirection {
  redirectionUrl: string;
  title: string;
}

export interface BillingModalContentProps {
  onClose: () => void;
  subscription?: UserSubscription;
  focusCredits?: boolean;
  onRedirecting?: (isRedirecting: boolean) => void;
  enforcePaymentMethod?: boolean;
  onLogout?: () => void;
}

export const BillingModalContent: FC<BillingModalContentProps> = ({
  onClose,
  subscription,
  focusCredits = false,
  onRedirecting,
  enforcePaymentMethod = false,
  onLogout,
}) => {
  const [redirection, setRedirection] = useState<BillingRedirection>();
  const { open: openDialog, close } = useDialog();
  const { paymentMethod } = useGetDefaultPaymentMethod(enforcePaymentMethod);
  const paymentMethodSync = usePaymentMethodSync();
  const isSyncingPaymentMethod = paymentMethodSync.status === 'PENDING';
  const hasCard = !!paymentMethod?.card?.lastFourDigits;
  const mustAddCard = enforcePaymentMethod && !hasCard && !isSyncingPaymentMethod;

  const onRedirect = (redirectionUrl: string, title: string) => {
    setRedirection({ redirectionUrl, title });
    onRedirecting?.(true);
  };

  const onUpgrade = () => {
    const canClose = !mustAddCard && !isSubscriptionMandatory(subscription);
    onClose();
    openDialog(<SubscriptionModal allowClose={canClose} />, { maxWidth: 'lg', fullWidth: true }, canClose);
  };

  if (redirection) return <SubscriptionRedirectStep redirectionUrl={redirection.redirectionUrl} title={redirection.title} />;

  return (
    <>
      <DialogTitle className='billing-title'>
        <AccountBalanceWalletRoundedIcon className='billing-title-icon' />
        Facturation
      </DialogTitle>
      <DialogContent className='billing-content'>
        <BillingSubscriptionSection subscription={subscription} onUpgrade={onUpgrade} />
        <BillingPaymentMethodSection onRedirect={onRedirect} sync={paymentMethodSync} />
        <BillingCreditsSection subscription={subscription} onRedirect={onRedirect} focusPacks={focusCredits} />
        {subscription?.status !== UserSubscriptionStatus.EMPTY && <BillingInvoicesSection />}
        <BillingCancellationSection subscription={subscription} />
      </DialogContent>
      <DialogActions className='billing-actions'>
        {enforcePaymentMethod && isSyncingPaymentMethod ? (
          <Button disabled name='billing-payment-method-syncing' className='billing-close' startIcon={<CircularProgress size={14} color='inherit' />}>
            Enregistrement de votre carte…
          </Button>
        ) : mustAddCard ? (
          <BPButton onClick={onLogout} name='billing-logout' label='Se déconnecter' />
        ) : (
          <Button onClick={enforcePaymentMethod ? close : onClose} name='billing-close' className='billing-close'>
            {enforcePaymentMethod ? 'Accéder à la plateforme' : 'Fermer'}
          </Button>
        )}
      </DialogActions>
    </>
  );
};
