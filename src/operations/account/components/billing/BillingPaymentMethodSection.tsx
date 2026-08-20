import { useGetDefaultPaymentMethod } from '@/operations/account/queries';
import { userSubscriptionProvider } from '@/providers';
import { SubscriptionCard } from '@bpartners/typescript-client';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { BillingSection } from './BillingSection';
import { formatCardBrand, formatCardExpiration } from './utils';

interface BillingPaymentMethodSectionProps {
  onRedirect: (redirectionUrl: string, title: string) => void;
}

const getCardLabel = (card?: SubscriptionCard) => `${formatCardBrand(card?.displayBrand)} •••• ${card?.lastFourDigits}`;

export const BillingPaymentMethodSection: FC<BillingPaymentMethodSectionProps> = ({ onRedirect }) => {
  const notify = useNotify();
  const { paymentMethod, isPaymentMethodLoading, isPaymentMethodError } = useGetDefaultPaymentMethod();
  const card = paymentMethod?.card;

  const { isPending, mutate } = useMutation({
    mutationKey: ['billing', 'paymentMethod'],
    mutationFn: () => userSubscriptionProvider.replacePaymentMethod(),
    onSuccess: ({ redirectionUrl }) =>
      redirectionUrl
        ? onRedirect(redirectionUrl, 'Vous allez être redirigé vers Stripe pour enregistrer votre moyen de paiement')
        : notify('Impossible d’ouvrir la page de saisie de votre moyen de paiement pour le moment.', { type: 'error' }),
    onError: (error: Error) => notify(error.message || 'messages.global.error', { type: 'error' }),
  });

  return (
    <BillingSection icon={<CreditCardRoundedIcon />} title='Moyen de paiement' subtitle='La carte utilisée pour vos abonnements et vos achats de crédits.'>
      {isPaymentMethodLoading ? (
        <Box className='billing-state'>
          <CircularProgress size={18} />
          Chargement de votre moyen de paiement…
        </Box>
      ) : (
        <Box className='billing-row'>
          <Box className='billing-card'>
            <Box className='billing-card-brand'>
              <CreditCardRoundedIcon />
            </Box>
            <Box>
              <Typography className='billing-card-number'>
                {isPaymentMethodError ? 'Moyen de paiement indisponible' : card ? getCardLabel(card) : 'Aucun moyen de paiement'}
              </Typography>
              <Typography className='billing-hint'>
                {isPaymentMethodError
                  ? 'Réessayez dans quelques instants.'
                  : card
                    ? formatCardExpiration(card)
                    : 'Enregistrez une carte pour souscrire et acheter des crédits.'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant='outlined'
            className='billing-action billing-action--outline'
            name='billing-update-payment-method'
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={14} color='inherit' /> : undefined}
            onClick={() => mutate()}
          >
            {card ? 'Remplacer la carte' : 'Ajouter une carte'}
          </Button>
        </Box>
      )}
    </BillingSection>
  );
};
