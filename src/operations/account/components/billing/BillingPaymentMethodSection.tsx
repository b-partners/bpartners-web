import { userSubscriptionProvider } from '@/providers';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { BillingSection } from './BillingSection';

const MASKED_CARD_NUMBER = '•••• •••• •••• ••••';

interface BillingPaymentMethodSectionProps {
  onRedirect: (redirectionUrl: string, title: string) => void;
}

export const BillingPaymentMethodSection: FC<BillingPaymentMethodSectionProps> = ({ onRedirect }) => {
  const notify = useNotify();

  const { isPending, mutate } = useMutation({
    mutationKey: ['billing', 'paymentMethod'],
    mutationFn: () => userSubscriptionProvider.checkoutSetup(),
    onSuccess: ({ redirectionUrl }) =>
      redirectionUrl
        ? onRedirect(redirectionUrl, 'Vous allez être redirigé vers Stripe pour mettre à jour votre moyen de paiement')
        : notify('Impossible d’ouvrir la page de saisie de votre moyen de paiement pour le moment.', { type: 'error' }),
    onError: (error: Error) => notify(error.message || 'messages.global.error', { type: 'error' }),
  });

  return (
    <BillingSection icon={<CreditCardRoundedIcon />} title='Moyen de paiement' subtitle='La carte utilisée pour vos abonnements et vos achats de crédits.'>
      <Box className='billing-row'>
        <Box className='billing-card'>
          <Box className='billing-card-brand'>
            <CreditCardRoundedIcon />
          </Box>
          <Box>
            <Typography className='billing-card-number'>{MASKED_CARD_NUMBER}</Typography>
            <Typography className='billing-hint'>Le détail de votre carte est géré par Stripe et n’est pas encore affiché ici.</Typography>
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
          Mettre à jour
        </Button>
      </Box>
    </BillingSection>
  );
};
