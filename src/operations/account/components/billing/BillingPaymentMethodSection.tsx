import { useGetDefaultPaymentMethod } from '@/operations/account/queries';
import { userSubscriptionProvider } from '@/providers';
import { SubscriptionCard } from '@bpartners/typescript-client';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { Box, Button, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { BillingSection } from './BillingSection';
import { PaymentMethodSync } from './use-payment-method-sync';
import { formatCardBrand, formatCardExpiration } from './utils';

interface BillingPaymentMethodSectionProps {
  onRedirect: (redirectionUrl: string, title: string) => void;
  sync?: PaymentMethodSync;
}

const getCardLabel = (card?: SubscriptionCard) => `${formatCardBrand(card?.displayBrand)} •••• ${card?.lastFourDigits}`;

export const BillingPaymentMethodSection: FC<BillingPaymentMethodSectionProps> = ({ onRedirect, sync }) => {
  const notify = useNotify();
  const { paymentMethod, isPaymentMethodLoading, isPaymentMethodError } = useGetDefaultPaymentMethod();
  const card = paymentMethod?.card;
  const isSyncing = sync?.status === 'PENDING';

  const { isPending, mutate } = useMutation({
    mutationKey: ['billing', 'paymentMethod'],
    mutationFn: () => userSubscriptionProvider.replacePaymentMethod(),
    onSuccess: ({ redirectionUrl }) =>
      redirectionUrl
        ? onRedirect(redirectionUrl, 'Vous allez être redirigé vers Stripe pour enregistrer votre moyen de paiement')
        : notify('Impossible d’ouvrir la page de saisie de votre moyen de paiement pour le moment.', { type: 'error' }),
    onError: (error: Error) => notify(error.message || 'messages.global.error', { type: 'error' }),
  });

  const getCardHint = () => {
    if (isPaymentMethodError) return 'Réessayez dans quelques instants.';
    if (card) return sync?.status === 'SYNCED' ? 'Carte enregistrée automatiquement après votre achat de crédits.' : formatCardExpiration(card);
    if (sync?.status === 'TIMEOUT') return 'Nous n’avons pas pu récupérer votre carte automatiquement, ajoutez-la manuellement.';
    return 'Enregistrez une carte pour souscrire et acheter des crédits.';
  };

  return (
    <BillingSection icon={<CreditCardRoundedIcon />} title='Moyen de paiement' subtitle='La carte utilisée pour vos abonnements et vos achats de crédits.'>
      {isSyncing ? (
        <Box className='billing-card-sync' id='billing-payment-method-sync'>
          <Box className='billing-card-sync-icon'>
            <CreditCardRoundedIcon />
          </Box>
          <Box className='billing-card-sync-main'>
            <Typography className='billing-card-sync-title'>Enregistrement de votre moyen de paiement…</Typography>
            <Typography className='billing-hint'>
              Nous récupérons la carte utilisée lors de votre achat de crédits, merci de patienter quelques instants.
            </Typography>
            <LinearProgress className='billing-card-sync-progress' variant='determinate' value={sync.progress} />
            <Typography className='billing-card-sync-attempt'>{`Tentative ${sync.attempt} sur ${sync.maxAttempts}`}</Typography>
          </Box>
        </Box>
      ) : isPaymentMethodLoading ? (
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
              <Typography className='billing-hint'>{getCardHint()}</Typography>
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
