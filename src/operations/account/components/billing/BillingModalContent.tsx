import { SubscriptionModal } from '@/common/components/SubscriptionModal';
import { SubscriptionRedirectStep } from '@/common/components/SubscriptionRedirectStep';
import { useDialog } from '@/common/store/dialog';
import { UserSubscription } from '@bpartners/typescript-client';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC, useState } from 'react';
import { BillingCancellationSection } from './BillingCancellationSection';
import { BillingCreditsSection } from './BillingCreditsSection';
import { BillingInvoicesSection } from './BillingInvoicesSection';
import { BillingPaymentMethodSection } from './BillingPaymentMethodSection';
import { BillingSubscriptionSection } from './BillingSubscriptionSection';

interface BillingRedirection {
  redirectionUrl: string;
  title: string;
}

export interface BillingModalContentProps {
  onClose: () => void;
  subscription?: UserSubscription;
  focusCredits?: boolean;
  onRedirecting?: (isRedirecting: boolean) => void;
}

export const BillingModalContent: FC<BillingModalContentProps> = ({ onClose, subscription, focusCredits = false, onRedirecting }) => {
  const [redirection, setRedirection] = useState<BillingRedirection>();
  const { open: openDialog } = useDialog();

  const onRedirect = (redirectionUrl: string, title: string) => {
    setRedirection({ redirectionUrl, title });
    onRedirecting?.(true);
  };

  const onUpgrade = () => {
    onClose();
    openDialog(<SubscriptionModal allowClose />, { maxWidth: 'lg', fullWidth: true }, true);
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
        <BillingInvoicesSection />
        <BillingCancellationSection subscription={subscription} />
      </DialogContent>
      <DialogActions className='billing-actions'>
        <Button onClick={onClose} name='billing-close' className='billing-close'>
          Fermer
        </Button>
      </DialogActions>
    </>
  );
};
