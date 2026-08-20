import { UserSubscription } from '@bpartners/typescript-client';
import { Dialog } from '@mui/material';
import { FC, useState } from 'react';
import { BillingModalContent } from './BillingModalContent';
import { BillingModalStyle } from './style';

interface BillingModalProps {
  open: boolean;
  onClose: () => void;
  subscription?: UserSubscription;
  focusCredits?: boolean;
}

export const BillingModal: FC<BillingModalProps> = ({ open, onClose, subscription, focusCredits, ...rest }) => {
  const [isRedirecting, setRedirecting] = useState(false);

  return (
    <Dialog open={open} onClose={isRedirecting ? undefined : onClose} maxWidth='lg' fullWidth sx={BillingModalStyle} {...rest}>
      <BillingModalContent onClose={onClose} subscription={subscription} focusCredits={focusCredits} onRedirecting={setRedirecting} />
    </Dialog>
  );
};
