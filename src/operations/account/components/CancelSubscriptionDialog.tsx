import { BPButton } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { formatFrenchDate } from '@/common/utils';
import { userSubscriptionProvider } from '@/providers';
import { Whoami } from '@bpartners/typescript-client';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useNotify } from 'react-admin';

interface CancelSubscriptionDialogProps {
  whoami: Whoami;
}

export const CancelSubscriptionDialog: FC<CancelSubscriptionDialogProps> = ({ whoami }) => {
  const { close: closeDialog } = useDialog();
  const notify = useNotify();
  const endDate = whoami?.user?.subscription?.end;
  const formattedEndDate = formatFrenchDate(new Date(endDate));

  const { isPending, mutate } = useMutation({
    mutationKey: ['subscription', 'layout', 'account', 'cancel'],
    mutationFn: userSubscriptionProvider.cancelRenew,
    onSuccess: () => {
      closeDialog();
      notify('messages.subscription.cancelSuccess', { messageArgs: { endDate: formattedEndDate }, type: 'success' });
    },
  });

  return (
    <>
      <DialogTitle>Confirmation de l'annulation du renouvellement automatique</DialogTitle>
      <DialogContent>
        <p>En confirmant l'annulation du renouvellement automatique de votre abonnement, voici ce qui se passera :</p>
        <ul>
          <li>
            Vous conserverez l'accès à toutes les fonctionnalités de votre abonnement jusqu'
            {endDate ? (
              <span>
                au <strong>{formattedEndDate}</strong>
              </span>
            ) : (
              <span>à la fin de la période en cours.</span>
            )}
          </li>
          <li>À la fin de cette période, votre abonnement ne sera pas renouvelé automatiquement et aucun paiement supplémentaire ne sera débité.</li>
          <li>Vous perdrez alors l'accès aux fonctionnalités premium liées à cet abonnement.</li>
        </ul>
      </DialogContent>
      <DialogActions>
        <BPButton onClick={() => mutate()} label='Confirmer' isLoading={isPending} />
      </DialogActions>
    </>
  );
};
