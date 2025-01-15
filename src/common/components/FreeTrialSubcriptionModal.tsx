import { getCached } from '@/providers';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import { useRedirect } from 'react-admin';
import { useDialog } from '../store/dialog';
import { formatDate } from '../utils';
import { BPButton } from './BPButton';

export const FreeTrialSubscriptionModal = () => {
  const { close } = useDialog();
  const whoami = getCached.whoami();
  const redirect = useRedirect();
  const today = dayjs();
  const remainingDays = dayjs(whoami?.user?.subscription?.end).diff(today, 'day');

  const goToAbonnmentPage = () => {
    close();
    redirect(`/account/${whoami?.user?.id}?tab=abonnement`);
  };

  return (
    <>
      <DialogTitle>Vous bénéficiez actuellement d'une période d'essai gratuite.</DialogTitle>
      <DialogContent>
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
        <BPButton onClick={close} label='Plus tard' />
        <BPButton label="M'abonner" onClick={goToAbonnmentPage} />
      </DialogActions>
    </>
  );
};
