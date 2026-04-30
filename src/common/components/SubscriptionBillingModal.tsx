import { cache, userSubscriptionProvider } from '@/providers';
import { Alert, AlertTitle, DialogActions, DialogContent, DialogTitle } from '@mui/material';
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

type SubscriptionBillingModalProps = {
  title: string;
  description: string;
  button: string;
  additionalDescription: string;
};

export const SubscriptionBillingModal: FC<SubscriptionBillingModalProps> = ({ title, description, button, additionalDescription }) => {
  const { isPending, mutate, error: billingPortalError } = useMutation({ mutationKey: ['subscription', 'modal'], mutationFn });

  const [searchParams] = useSearchParams();

  const error = searchParams.get('stripeStatus') === 'error' || !!billingPortalError;
  const errorMessage = (billingPortalError as any)?.response?.data?.message;

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' variant='filled'>
            <AlertTitle>Une erreur s'est produite.</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        <p>{description}</p>
        <p>{additionalDescription}</p>
      </DialogContent>
      <DialogActions>
        <BPButton data-cy='subscription-billing-btn' onClick={() => mutate()} label={button} isLoading={isPending} />
      </DialogActions>
    </>
  );
};
