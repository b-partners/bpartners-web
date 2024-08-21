import { BP_COLOR } from '@/bp-theme';
import { Avatar, Box, Typography } from '@mui/material';
import { green, grey, yellow } from '@mui/material/colors';
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

export const SubscriptionLayout = () => (
  <SimpleShowLayout>
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${BP_COLOR['solid_grey']}`, pb: 2, mb: 2 }}>
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
    </Box>

    <Typography variant='h6'>Pour 7€ HT par mois:</Typography>
    {infos.map(props => (
      <InfoShow {...props} key={props.icon} />
    ))}
  </SimpleShowLayout>
);
