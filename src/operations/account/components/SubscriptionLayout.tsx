import { BP_COLOR } from '@/bp-theme';
import { BPButton } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { formatDate } from '@/common/utils';
import { SubscriptionInfos } from '@/constants';
import { whoami } from '@/providers';
import { Whoami } from '@bpartners/typescript-client';
import { Avatar, Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SimpleShowLayout } from 'react-admin';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { InfoShow } from './InfoShow';

export const SubscriptionLayout = () => {
  const { data, isLoading } = useQuery<Whoami>({ queryKey: ['subscription', 'layout', 'account'], queryFn: whoami });
  const { open: openDialog } = useDialog();
  const isAlreadyCancelled = data?.user?.subscription?.status === 'CANCELLED';

  const handleCancelSubscription = () => {
    !isLoading && data && !isAlreadyCancelled && openDialog(<CancelSubscriptionDialog whoami={data} />);
  };

  return (
    <SimpleShowLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${BP_COLOR['solid_grey']}`, pb: 2, mb: 2 }}>
        <Stack direction='row' alignItems='center' flexGrow={1}>
          <Avatar
            variant='rounded'
            sx={{ background: BP_COLOR[5] }}
            alt='Votre abonnement'
            src='https://www.bpartners.app/static/media/essentiel.cb090d9cf088f1bc56cf.png'
          />
          <Box ml={2}>
            <Typography variant='h5'>L'essentiel</Typography>
            <Typography color='text.secondary' component='b'>
              Tous les services essentiels pour gérer votre activité d'artisan ou d'indépendant
            </Typography>
          </Box>
        </Stack>
        <Tooltip
          sx={{ cursor: 'pointer', 'user-select': 'none' }}
          title="Votre abonnement prendra fin à cette date et vous ne pourrez plus utiliser l'application sans vous réabonner."
        >
          <Stack>
            <Typography color='text.secondary' component='b'>
              Date d'expiration
            </Typography>
            {!isLoading && <Typography variant='h6'>{formatDate(new Date(data?.user.subscription?.end))}</Typography>}
            {isLoading && <Skeleton width='100%' />}
          </Stack>
        </Tooltip>
      </Box>

      <Typography variant='h6'>Pour 49€ par mois:</Typography>
      {SubscriptionInfos.map(props => (
        <InfoShow {...props} key={props.icon} />
      ))}
      <Box>
        <BPButton onClick={handleCancelSubscription} disabled={isAlreadyCancelled} label='Annuler le renouvellement de mon abonnement' />
      </Box>
    </SimpleShowLayout>
  );
};
