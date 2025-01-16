import { getCached } from '@/providers';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import { useDialog } from '../store/dialog';
import { formatDate } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionModal } from './SubscriptionModal';

export const FreeTrialSubscriptionModal = () => {
  const { close, open: openDialog } = useDialog();
  const whoami = getCached.whoami();
  const today = dayjs();
  const remainingDays = dayjs(whoami?.user?.subscription?.end).diff(today, 'day');

  const handleDoSubscription = () => {
    openDialog(<SubscriptionModal allowClose />, undefined, true);
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
          <li style={{ fontWeight: 'bold' }}>Aucun prélèvement ne se fera avant la fin de votre période d’essai de 14 jours.</li>
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
        <BPButton data-testid='close-dialog' onClick={close} label='Plus tard' />
        <BPButton data-testid='do-abonnement-btn' label="M'abonner" onClick={handleDoSubscription} />
      </DialogActions>
    </>
  );
};
