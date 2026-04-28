import { useDialog } from '@/common/store/dialog';
import { cache, userSubscriptionProvider, getCached } from '@/providers';
import dayjs from 'dayjs';
import { Alert, AlertTitle, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatDate, getFirstDebitDate, Redirect } from '../utils';
import { BPButton } from './BPButton';

const mutationFn = async () => {
  const { redirectionUrl } = await userSubscriptionProvider.init();
  cache.whoami(undefined);
  cache.user(undefined);
  Redirect.toURL(redirectionUrl);
  return redirectionUrl;
};

export const SubscriptionModal: FC<{ allowClose?: boolean }> = ({ allowClose = false }) => {
  const { isPending, mutate, error: subscriptionInitError } = useMutation({ mutationKey: ['subscription', 'modal'], mutationFn });
  const { close } = useDialog();

  const [searchParams] = useSearchParams();

  const error = searchParams.get('stripeStatus') === 'error' || !!subscriptionInitError;
  const errorMessage = (subscriptionInitError as any)?.response?.data?.message;

  const whoami = getCached.whoami();
  const today = dayjs();
  const remainingDays = dayjs(whoami?.user?.subscription?.end).diff(today, 'day');
  const startDate = new Date(whoami?.user?.subscription?.start);
  const endDate = new Date(whoami?.user?.subscription?.end);
  const firstDebitDate = getFirstDebitDate(startDate, endDate);

  return (
    <>
      <DialogTitle>Finalisez votre inscription en toute sérénité !</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' variant='filled'>
            <AlertTitle>Une erreur s'est produite.</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        <p>
          Activez votre abonnement aujourd'hui pour <span style={{ fontWeight: 'bold' }}>49€ HT</span>, votre carte ne sera débitée qu'à compter du <span style={{ fontWeight: 'bold' }}>{formatDate(firstDebitDate)}</span>.
        </p>
        <ul>
          <li>
            <span style={{ fontWeight: 'bold' }}>Début de la période d'essai</span> : {formatDate(startDate)}
          </li>
          <li>
            <span style={{ fontWeight: 'bold' }}>Fin de la période d'essai</span> : {formatDate(endDate)}
          </li>
          <li>
            <span style={{ fontWeight: 'bold' }}>Nombre de jours restants</span> : {remainingDays} jour{remainingDays > 1 ? 's' : ''}
          </li>
        </ul>
        <p>💡 Aucun prélèvement ne sera effectué avant la fin de votre période d’essai. Vous pouvez annuler à tout moment, sans engagement.</p>
        <p>
          Si vous avez la moindre question, n’hésitez à nous appeler au{' '}
          <a rel='noreferrer' href='tel:0668624836' target='_blank'>
            06.68.62.48.36
          </a>{' '}
          ou par mail à{' '}
          <a rel='noreferrer' href='mailto:contact@birdia.fr' target='_blank'>
            contact@birdia.fr
          </a>
        </p>
      </DialogContent>
      <DialogActions>
        {allowClose && <BPButton onClick={() => close()} label='Plus tard' isLoading={isPending} />}
        <BPButton data-cy='subscribe-btn' onClick={() => mutate()} label="S'abonner" isLoading={isPending} />
      </DialogActions>
    </>
  );
};
