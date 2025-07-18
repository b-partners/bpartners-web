import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Card, CardContent, Typography } from '@mui/material';

export const SubscriptionCard = () => {
  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Typography className='section-title-subscription'>Mon abonnement</Typography>
        <Typography className='price-subscription'>Pour 49 € par mois :</Typography>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li className='list-subscription'>
            <ArrowRightRoundedIcon className='arrow-list' />
            Activation de notre intelligence artificielle qui analyse les toitures de vos prospects et organise le suivi des toitures de vos clients existants.
            20 toitures incluses puis 2€ par toiture supplémentaire
          </li>
          <li className='list-subscription'>
            <ArrowRightRoundedIcon className='arrow-list' />
            Accès aux outils de devis/facturation personnalisé, gestion des acomptes, relance impayés CRM, gestion des produits, synchronisation bancaire et
            suivi de trésorerie.
          </li>
          <li className='list-subscription'>
            <ArrowRightRoundedIcon className='arrow-list' />
            Initiez la collecte de vos encaissements instantanément par QR code, Mails ou SMS en 1 clic. Lien de paiement intégré à la facture pour seulement
            0,99%
          </li>
          <li className='list-subscription'>
            <ArrowRightRoundedIcon className='arrow-list' />
            Support 7/7
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
