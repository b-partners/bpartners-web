import { SubscriptionRedirectStep } from '@/common/components/SubscriptionRedirectStep';
import { useDialog } from '@/common/store/dialog';
import { getCached } from '@/providers';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingCreditsSection } from './BillingCreditsSection';

interface CreditsRedirection {
  redirectionUrl: string;
  title: string;
}

export const CreditsRequiredModalContent = () => {
  const { close } = useDialog();
  const navigate = useNavigate();
  const [redirection, setRedirection] = useState<CreditsRedirection>();

  const onRedirect = (redirectionUrl: string, title: string) => setRedirection({ redirectionUrl, title });

  const onNotNow = () => {
    close();
    navigate('/');
  };

  if (redirection) return <SubscriptionRedirectStep redirectionUrl={redirection.redirectionUrl} title={redirection.title} />;

  return (
    <>
      <DialogTitle className='billing-title'>
        <BoltRoundedIcon className='billing-title-icon' />
        Crédits d’analyses insuffisants
      </DialogTitle>
      <DialogContent className='billing-content'>
        <Typography className='credits-required-message'>
          Votre solde de crédits est insuffisant pour lancer une nouvelle analyse ou une modélisation 3D. Achetez un pack de crédits pour continuer.
        </Typography>
        <BillingCreditsSection subscription={getCached.user()?.subscription} onRedirect={onRedirect} onCompleted={close} focusPacks />
      </DialogContent>
      <DialogActions className='billing-actions'>
        <Button onClick={onNotNow} name='credits-required-not-now' className='billing-close'>
          Pas maintenant
        </Button>
      </DialogActions>
    </>
  );
};
