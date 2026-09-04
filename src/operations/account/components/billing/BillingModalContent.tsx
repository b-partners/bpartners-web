import { SubscriptionModal } from '@/common/components/SubscriptionModal';
import { SubscriptionRedirectStep } from '@/common/components/SubscriptionRedirectStep';
import { useOptimisticCreditBalanceStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { useGetCreditBalance } from '@/operations/account/queries';
import { UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC, useState } from 'react';
import { BillingCancellationSection } from './BillingCancellationSection';
import { BillingCreditsSection } from './BillingCreditsSection';
import { BillingInvoicesSection } from './BillingInvoicesSection';
import { BillingPaymentMethodSection } from './BillingPaymentMethodSection';
import { BillingSubscriptionSection } from './BillingSubscriptionSection';
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
  enforceCredits?: boolean;
  onLogout?: () => void;
}

export const BillingModalContent: FC<BillingModalContentProps> = ({
  onClose,
  subscription,
  focusCredits = false,
  onRedirecting,
  enforceCredits = false,
  onLogout,
}) => {
  const [redirection, setRedirection] = useState<BillingRedirection>();
  const { open: openDialog, close } = useDialog();
  const { balance } = useGetCreditBalance(enforceCredits);
  const optimisticBalance = useOptimisticCreditBalanceStore(state => state.balance);
  const spendableCredits = (optimisticBalance ?? balance)?.spendableCredits ?? 0;
  const mustBuyCredits = enforceCredits && spendableCredits <= 0;

  const onRedirect = (redirectionUrl: string, title: string) => {
    setRedirection({ redirectionUrl, title });
    onRedirecting?.(true);
  };

  const onUpgrade = () => {
    const canClose = !isSubscriptionMandatory(subscription);
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
        <BillingPaymentMethodSection onRedirect={onRedirect} />
        <BillingCreditsSection subscription={subscription} onRedirect={onRedirect} focusPacks={focusCredits} />
        {subscription?.status !== UserSubscriptionStatus.EMPTY && <BillingInvoicesSection />}
        <BillingCancellationSection subscription={subscription} />
      </DialogContent>
      <DialogActions className='billing-actions'>
        {mustBuyCredits ? (
          <Button onClick={onLogout} name='billing-logout' className='billing-close'>
            Se déconnecter
          </Button>
        ) : (
          <Button onClick={enforceCredits ? close : onClose} name='billing-close' className='billing-close'>
            {enforceCredits ? 'Accéder à la plateforme' : 'Fermer'}
          </Button>
        )}
      </DialogActions>
    </>
  );
};
