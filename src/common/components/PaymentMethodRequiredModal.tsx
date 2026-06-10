import { cache, userSubscriptionProvider } from '@/providers';
import { Alert, AlertTitle, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';

const mutationFn = async () => {
  const { redirectionUrl } = await userSubscriptionProvider.checkoutSetup();
  cache.whoami(undefined);
  cache.user(undefined);
  Redirect.toURL(redirectionUrl);
  return redirectionUrl;
};

export const PaymentMethodRequiredModal = () => {
  const onGetDemo = () => Redirect.toURL('https://meet.brevo.com/birdia/reunion-de-15-minutes');
  const { isPending, mutate, error: paymentMethodInsertionError } = useMutation({ mutationKey: ['subscription', 'modal'], mutationFn });

  const [searchParams] = useSearchParams();

  const error = searchParams.get('stripeStatus') === 'error' || !!paymentMethodInsertionError;
  const errorMessage = (paymentMethodInsertionError as any)?.response?.data?.message;

  return (
    <>
      <DialogTitle>Débloquez immédiatement votre accès en :</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' variant='filled'>
            <AlertTitle>Une erreur s'est produite.</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        <Stack>
          <Typography>👉 renseignant un moyen de paiement (aucun prélèvement pendant l’essai)</Typography>
          <Typography>ou</Typography>
          <Typography>👉 réservant une démo avec un expert BIRDIA pour obtenir votre code d’accès personnalisé</Typography>
        </Stack>
        <p>💡 Aucun prélèvement ne sera effectué avant que vous ne souscriviez à un abonnement.</p>
        <p>
          Si vous avez la moindre question, n’hésitez à nous appeler au
          <a rel='noreferrer' href='tel:0668624836' target='_blank'>
            {' 06.68.62.48.36 '}
          </a>
          {'ou par mail à '}
          <a rel='noreferrer' href='mailto:contact@birdia.fr' target='_blank'>
            contact@birdia.fr
          </a>
        </p>
      </DialogContent>
      <DialogActions>
        <BPButton data-testid='close-dialog' onClick={onGetDemo} label='Réserver une démo' />
        <BPButton data-testid='add-payment-method-btn' label='Ajouter un moyen de paiement' onClick={() => mutate()} isLoading={isPending} />
      </DialogActions>
    </>
  );
};
