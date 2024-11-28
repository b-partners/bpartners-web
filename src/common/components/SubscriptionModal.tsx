import { cache, userSubscriptionProvider } from '@/providers';
import { Alert, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
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

export const SubscriptionModal = () => {
  const { isPending, mutate } = useMutation({ mutationKey: ['subscription', 'modal'], mutationFn });

  const [searchParams] = useSearchParams();

  const error = searchParams.get('stripeStatus');

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
          <li>Aucun prélèvement ne se fera avant la fin de votre période d’essai de 14 jours.</li>
          <li>⁠Vous pouvez arrêter</li>
        </ul>
        <p>
          votre abonnement à tout moment dans l’application. Si vous avez la moindre question, N’hésitez à nous appeler au{' '}
          <a href='tel:0668624836' target='_blank'>
            06.68.62.48.36
          </a>{' '}
          ou par mail à{' '}
          <a href='mailto:contact@bpartners.app' target='_blank'>
            contact@bpartners.app
          </a>
        </p>
      </DialogContent>
      <DialogActions>
        <BPButton onClick={() => mutate()} label="S'abonner" isLoading={isPending} />
      </DialogActions>
    </>
  );
};
