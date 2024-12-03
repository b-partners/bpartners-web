import { BP_COLOR } from '@/bp-theme';
import { BPButton } from '@/common/components';
import { formatDate } from '@/common/utils';
import { userSubscriptionProvider, whoami } from '@/providers';
import { Whoami } from '@bpartners/typescript-client';
import { Avatar, Box, Skeleton, Stack, Typography } from '@mui/material';
import { green, grey, yellow } from '@mui/material/colors';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SimpleShowLayout } from 'react-admin';
import { InfoShow } from './InfoShow';
import { InfoShowProps } from './types';

const infos: InfoShowProps[] = [
  {
    content: `Activation de notre intelligence artificielle qui analyse les toitures de vos prospects et organise le suivi des toitures de vos clients existants. 20 toitures incluses puis 2€ par toiture supplémentaire`,
    icon: 'SmartToy',
    color: grey[500],
  },
  {
    content:
      'Accès aux outils de devis/facturation personnalisé, gestion des acomptes, relance impayés CRM, gestion des produits, synchronisation bancaire et suivi de trésorerie.',
    icon: 'Handyman',
    color: yellow[800],
  },
  {
    content:
      'Initiez la collecte de vos encaissements instantanément par QR code, Mails ou SMS en 1 clic. Lien de paiement intégré à la facture pour seulement 0,99%',
    icon: 'QrCode',
    color: '#000',
  },
  { content: 'Support 7/7', icon: 'AccessTime', color: green[500] },
];

export const SubscriptionLayout = () => {
  const { data, isLoading } = useQuery<Whoami>({ queryKey: ['subscription', 'layout', 'account'], queryFn: whoami });
  const { isPending, mutate } = useMutation({ mutationKey: ['subscription', 'layout', 'account', 'cancel'], mutationFn: userSubscriptionProvider.cancelRenew });
  const allowSubscription = JSON.parse(process.env.REACT_APP_ALLOW_SUBSCRIPTION || 'false');
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
        <Stack>
          <Typography color='text.secondary' component='b'>
            Date d'expiration
          </Typography>
          {!isLoading && <Typography variant='h5'>{formatDate(new Date(data?.user.subscription?.end))}</Typography>}
          {isLoading && <Skeleton width='100%' />}
        </Stack>
      </Box>

      <Typography variant='h6'>Pour 49€ par mois:</Typography>
      {infos.map(props => (
        <InfoShow {...props} key={props.icon} />
      ))}
      {allowSubscription && (
        <Box>
          <BPButton
            isLoading={isPending}
            onClick={() => mutate()}
            disabled={!(data?.user?.subscription?.status && data?.user?.subscription?.status !== 'CANCELLED')}
            label='Annuler le renouvellement de mon abonnement'
          />
        </Box>
      )}
    </SimpleShowLayout>
  );
};
