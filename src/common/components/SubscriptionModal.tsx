import { useDialog } from '@/common/store/dialog';
import { cache, userSubscriptionProvider } from '@/providers';
import { Alert, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';

const mutationFn = async () => {
  const { redirectionUrl } = await userSubscriptionProvider.init();
  cache.whoami(undefined);
  cache.user(undefined);
  Redirect.toURL(redirectionUrl);
  return redirectionUrl;
};

export const SubscriptionModal: FC<{ allowClose?: boolean }> = ({ allowClose = false }) => {
  const { isPending, mutate } = useMutation({ mutationKey: ['subscription', 'modal'], mutationFn });
  const { close } = useDialog();

  const [searchParams] = useSearchParams();

  const error = searchParams.get('stripeStatus') === 'error';

  return (
    <>
      <DialogTitle>Finalisez votre inscription en toute sérénité !</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' variant='filled'>
            Une erreur s'est produite, veuillez recommencer.
          </Alert>
        )}
        <p>
          Vous n’avez pas encore d’abonnement actif. Pour continuer à utiliser l’application BPartners, veuillez enregistrer votre carte bancaire via notre
          partenaire sécurisé Stripe.
        </p>
        <p>💡 Pas d’inquiétude :</p>
        <ul>
          <li>⁠Vous pouvez arrêter votre abonnement à tout moment dans l’application.</li>
        </ul>
        <p>
          Si vous avez la moindre question, N’hésitez à nous appeler au{' '}
          <a rel='noreferrer' href='tel:0668624836' target='_blank'>
            06.68.62.48.36
          </a>{' '}
          ou par mail à{' '}
          <a rel='noreferrer' href='mailto:contact@bpartners.app' target='_blank'>
            contact@bpartners.app
          </a>
        </p>
      </DialogContent>
      <DialogActions>
        {allowClose && <BPButton onClick={() => close()} label='Plus tard' isLoading={isPending} />}
        <BPButton onClick={() => mutate()} label="S'abonner" isLoading={isPending} />
      </DialogActions>
    </>
  );
};
