import { cache } from '@/providers';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, DialogContent, Typography } from '@mui/material';
import { FC, useEffect } from 'react';
import { Redirect } from '../utils';
import { SubscriptionRedirectStyle } from './style';

const REDIRECT_DELAY_MS = 2500;

const isStripeUrl = (url: string) => {
  try {
    return /(^|\.)stripe\.com$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

interface SubscriptionRedirectStepProps {
  redirectionUrl: string;
  title?: string;
}

export const SubscriptionRedirectStep: FC<SubscriptionRedirectStepProps> = ({ redirectionUrl, title }) => {
  const stripe = isStripeUrl(redirectionUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
      cache.whoami(undefined);
      cache.user(undefined);
      Redirect.toURL(redirectionUrl);
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [redirectionUrl]);

  return (
    <DialogContent>
      <Box sx={SubscriptionRedirectStyle}>
        <Box className='redirect-arrow'>
          <ArrowForwardRoundedIcon />
        </Box>
        <Typography className='redirect-title'>
          {title ?? (stripe ? 'Vous allez être redirigé vers Stripe pour souscrire à l’abonnement' : 'Votre abonnement est en cours d’enregistrement')}
        </Typography>
        <Typography className='redirect-subtitle'>Merci de patienter, vous allez être redirigé automatiquement.</Typography>
      </Box>
    </DialogContent>
  );
};
