import { getCached } from '@/providers';
import { DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useDialog } from '../store/dialog';
import { formatDate, Redirect } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionModal } from './SubscriptionModal';

export const FreeTrialSubscriptionModal = () => {
  const { open: openDialog } = useDialog();
  const whoami = getCached.whoami();
  const today = dayjs();
  const remainingDays = dayjs(whoami?.user?.subscription?.end).diff(today, 'day');

  const handleDoSubscription = () => {
    openDialog(<SubscriptionModal allowClose />, undefined, true);
  };

  const onGetDemo = () => Redirect.toURL('https://meet.brevo.com/birdia/reunion-de-15-minutes');

  return (
    <>
      <DialogTitle>Débloquez immédiatement votre accès en :</DialogTitle>
      <DialogContent>
        <Stack>
          <Typography>👉 renseignant un moyen de paiement (aucun prélèvement pendant l’essai)</Typography>
          <Typography>ou</Typography>
          <Typography>👉 réservant une démo avec un expert BIRDIA pour obtenir votre code d’accès personnalisé</Typography>
        </Stack>
        <ul>
          <li>
            <span style={{ fontWeight: 'bold' }}>Début de la période d'essai</span> : {formatDate(new Date(whoami?.user?.subscription?.start))}
          </li>
          <li>
            <span style={{ fontWeight: 'bold' }}>Fin de la période d'essai</span> : {formatDate(new Date(whoami?.user?.subscription?.end))}
          </li>
          <li>
            <span style={{ fontWeight: 'bold' }}>Nombre de jours restants</span> : {remainingDays} jour{remainingDays > 1 ? 's' : ''}
          </li>
        </ul>
        <p>💡 Aucun prélèvement ne sera effectué avant la fin de votre période d’essai. Vous pouvez annuler à tout moment, sans engagement.</p>
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
        <BPButton data-testid='do-abonnement-btn' label="M'abonner" onClick={handleDoSubscription} />
      </DialogActions>
    </>
  );
};
