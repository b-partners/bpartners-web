import { InfoShowProps } from '@/operations/account/components';
import { green, grey, yellow } from '@mui/material/colors';

export const SubscriptionInfos: InfoShowProps[] = [
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
