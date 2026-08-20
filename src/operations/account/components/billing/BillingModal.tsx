import { SubscriptionModal, SubscriptionRedirectStep } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { UserSubscription } from '@bpartners/typescript-client';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC, useState } from 'react';
import { BillingCreditsSection } from './BillingCreditsSection';
import { BillingInvoicesSection } from './BillingInvoicesSection';
import { BillingPaymentMethodSection } from './BillingPaymentMethodSection';
import { BillingSubscriptionSection } from './BillingSubscriptionSection';
import { BillingModalStyle } from './style';

interface BillingRedirection {
  redirectionUrl: string;
  title: string;
}

interface BillingModalProps {
  open: boolean;
  onClose: () => void;
  subscription?: UserSubscription;
}

export const BillingModal: FC<BillingModalProps> = ({ open, onClose, subscription, ...rest }) => {
  const [redirection, setRedirection] = useState<BillingRedirection>();
  const { open: openDialog } = useDialog();

  const onRedirect = (redirectionUrl: string, title: string) => setRedirection({ redirectionUrl, title });

  const onUpgrade = () => {
    onClose();
    openDialog(<SubscriptionModal allowClose />, { maxWidth: 'lg', fullWidth: true }, true);
  };

  return (
    <Dialog open={open} onClose={redirection ? undefined : onClose} maxWidth='lg' fullWidth sx={BillingModalStyle} {...rest}>
      {redirection ? (
        <SubscriptionRedirectStep redirectionUrl={redirection.redirectionUrl} title={redirection.title} />
      ) : (
        <>
          <DialogTitle className='billing-title'>
            <AccountBalanceWalletRoundedIcon className='billing-title-icon' />
            Facturation
          </DialogTitle>
          <DialogContent className='billing-content'>
            <BillingSubscriptionSection subscription={subscription} onUpgrade={onUpgrade} />
            <BillingPaymentMethodSection onRedirect={onRedirect} />
            <BillingCreditsSection subscription={subscription} onRedirect={onRedirect} />
            <BillingInvoicesSection />
          </DialogContent>
          <DialogActions className='billing-actions'>
            <Button onClick={onClose} name='billing-close' className='billing-close'>
              Fermer
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
