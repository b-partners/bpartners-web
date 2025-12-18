import { cache, userSubscriptionProvider } from '@/providers';
import { Alert, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';

const mutationFn = async () => {
  const { redirectionUrl } = await userSubscriptionProvider.billingPortal();
  cache.whoami(undefined);
  cache.user(undefined);
  Redirect.toURL(redirectionUrl);
  return redirectionUrl;
};

export const SubscriptionBillingModal: FC = () => {
  const { isPending, mutate } = useMutation({ mutationKey: ['subscription', 'modal'], mutationFn });

  const [searchParams] = useSearchParams();

  const error = searchParams.get('stripeStatus') === 'error';

  return (
    <>
      <DialogTitle>Factures impayées</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' variant='filled'>
            Une erreur s'est produite, veuillez recommencer.
          </Alert>
        )}
        <p>Il vous reste des factures impayées.</p>
        <p>Pour continuer à utiliser l’application, veuillez régulariser votre situation.</p>
      </DialogContent>
      <DialogActions>
        <BPButton data-cy='subscribe-btn' onClick={() => mutate()} label='Payer mon abonnement' isLoading={isPending} />
      </DialogActions>
    </>
  );
};
