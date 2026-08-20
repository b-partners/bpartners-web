import { useToggle } from '@/common/hooks';
import { cache, userSubscriptionProvider } from '@/providers';
import { UserSubscription } from '@bpartners/typescript-client';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { BillingSection } from './BillingSection';
import { SubscriptionCancelConfirmDialog } from './SubscriptionCancelConfirmDialog';
import { formatDate, hasActivePlan, isSubscriptionCancellationEnabled } from './utils';

interface BillingCancellationSectionProps {
  subscription?: UserSubscription;
}

export const BillingCancellationSection: FC<BillingCancellationSectionProps> = ({ subscription }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { value: isConfirmOpen, handleOpen, handleClose } = useToggle();

  const { isPending, mutate } = useMutation({
    mutationKey: ['subscription', 'cancel'],
    mutationFn: () => userSubscriptionProvider.cancelRenew(),
    onSuccess: () => {
      handleClose();
      notify('Votre abonnement ne sera pas renouvelé.', { type: 'success' });
      cache.user(undefined);
      refresh();
    },
    onError: (error: any) => notify(error?.response?.data?.message || error?.message || 'messages.global.error', { type: 'error' }),
  });

  const endDate = formatDate(subscription?.end);

  if (!isSubscriptionCancellationEnabled() || !hasActivePlan(subscription)) return null;

  return (
    <BillingSection
      icon={<HighlightOffRoundedIcon />}
      title='Résilier mon abonnement'
      subtitle='La résiliation arrête le renouvellement, votre accès reste ouvert jusqu’à la fin de la période déjà payée.'
    >
      <Box className='billing-row'>
        <Box className='billing-row-main'>
          <Typography className='billing-value'>
            {endDate ? `Accès conservé jusqu’au ${endDate}` : 'Accès conservé jusqu’à la fin de la période payée'}
          </Typography>
          <Typography className='billing-hint'>Vos crédits achetés restent disponibles après la résiliation.</Typography>
        </Box>
        <Button
          variant='outlined'
          className='billing-action billing-action--danger'
          name='billing-cancel-subscription'
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={14} color='inherit' /> : undefined}
          onClick={handleOpen}
        >
          Résilier mon abonnement
        </Button>
      </Box>
      <SubscriptionCancelConfirmDialog open={isConfirmOpen} endDate={endDate} isPending={isPending} onCancel={handleClose} onConfirm={() => mutate()} />
    </BillingSection>
  );
};
