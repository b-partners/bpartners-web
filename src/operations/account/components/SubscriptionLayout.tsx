import { BP_COLOR } from '@/bp-theme';
import { BPButton, SubscriptionModal } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { formatDate } from '@/common/utils';
import { SubscriptionInfos } from '@/constants';
import { whoami } from '@/providers';
import { UserSubscriptionStatus, Whoami } from '@bpartners/typescript-client';
import { Avatar, Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SimpleShowLayout } from 'react-admin';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { InfoShow } from './InfoShow';

export const SUBSCRIPTION_RANGE_LABELS: {
  [T in keyof typeof UserSubscriptionStatus]?: {
    start?: string;
    end?: string;
    title: string;
    description: string;
  };
} = {
  EMPTY: {
    title: 'Aucun abonnement actif',
    description: "Vous n'avez actuellement souscrit à aucun abonnement.",
  },
  CANCELLED: {
    title: 'Renouvellement abonnment annulé',
    description: 'Vous avez annulé le renouvellement automatique de votre abonnement.',
    start: "Début de la période d'abonnement en cours",
    end: "Fin de la période d'abonnement en cours",
  },
  ACTIVE: {
    title: "L'essentiel",
    description: "Tous les services essentiels pour gérer votre activité d'artisan ou d'indépendant.",
    start: "Début de la période d'abonnement en cours",
    end: "Fin de la période d'abonnement en cours",
  },
  FREE_TRIAL: {
    title: "Période d'essai",
    description: "Vous bénéficiez actuellement d'une période d'essai gratuite.",
    start: "Début de la période d'essai",
    end: "Fin de la période d'essai",
  },
};
export const SubscriptionLayout = () => {
  const { data, isLoading } = useQuery<Whoami>({ queryKey: ['subscription', 'layout', 'account'], queryFn: whoami });
  const { open: openDialog } = useDialog();
  const userSubscriptionStatus = data?.user?.subscription?.status;
  const isAlreadyCancelled = userSubscriptionStatus === 'CANCELLED';
  const isActiveSubscription = userSubscriptionStatus === 'ACTIVE';
  const isEmptySubcription = userSubscriptionStatus === 'EMPTY';
  const isFreeTrialSubscription = userSubscriptionStatus === 'FREE_TRIAL';
  const endingDate = data?.user.subscription?.end;
  const startingDate = data?.user.subscription?.start;

  const handleCancelSubscription = () => {
    !isLoading && data && !isAlreadyCancelled && openDialog(<CancelSubscriptionDialog whoami={data} />);
  };

  const handleDoSubscription = () => {
    openDialog(<SubscriptionModal allowClose />, undefined, true);
  };

  const subcriptionLabels = SUBSCRIPTION_RANGE_LABELS[userSubscriptionStatus];

  return (
    <SimpleShowLayout>
      <Box sx={{ borderBottom: `1px solid ${BP_COLOR['solid_grey']}`, pb: 2, mb: 2 }}>
        <Stack direction='row' alignItems='center' flexGrow={1}>
          <Avatar
            variant='rounded'
            sx={{ background: BP_COLOR[5] }}
            alt='Votre abonnement'
            src='https://www.bpartners.app/static/media/essentiel.cb090d9cf088f1bc56cf.png'
          />
          <Box ml={2}>
            {isLoading ? (
              <Skeleton width='100%' />
            ) : (
              <>
                <Typography variant='h5'>{subcriptionLabels?.title}</Typography>
                <Typography color='text.secondary' component='b'>
                  {subcriptionLabels?.description}
                </Typography>
              </>
            )}
          </Box>
        </Stack>
        {!isEmptySubcription && (
          <>
            <Box sx={{ mt: 2, justifyContent: 'space-between', ml: 7 }}>
              <Tooltip sx={{ cursor: 'pointer', 'user-select': 'none' }} title='Votre abonnement a débuté à cette date.'>
                <Stack sx={{ mb: '5px' }} direction='column'>
                  {startingDate && (
                    <Typography color='text.secondary' component='b'>
                      {subcriptionLabels.start}
                    </Typography>
                  )}
                  {!isLoading && startingDate && (
                    <Typography sx={{ fontSize: '1rem' }} variant='h6'>
                      {formatDate(new Date(startingDate))}
                    </Typography>
                  )}
                  {isLoading && <Skeleton width='100%' />}
                </Stack>
              </Tooltip>
              <Tooltip
                sx={{ cursor: 'pointer', 'user-select': 'none' }}
                title="Votre abonnement prendra fin à cette date et vous ne pourrez plus utiliser l'application sans vous réabonner."
              >
                <Stack direction='column'>
                  {endingDate && (
                    <Typography color='text.secondary' component='b'>
                      {subcriptionLabels.end}
                    </Typography>
                  )}
                  {!isLoading && endingDate && (
                    <Typography sx={{ fontSize: '1rem' }} variant='h6'>
                      {formatDate(new Date(endingDate))}
                    </Typography>
                  )}
                  {isLoading && <Skeleton width='100%' />}
                </Stack>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>
      <Typography variant='h6'>Pour 49€ par mois:</Typography>
      {SubscriptionInfos.map(props => (
        <InfoShow {...props} key={props.icon} />
      ))}
      <Box>
        {isFreeTrialSubscription ? (
          <BPButton onClick={handleDoSubscription} label="M'abonner" />
        ) : (
          <BPButton onClick={handleCancelSubscription} disabled={!isActiveSubscription} label='Annuler le renouvellement de mon abonnement' />
        )}
      </Box>
    </SimpleShowLayout>
  );
};
