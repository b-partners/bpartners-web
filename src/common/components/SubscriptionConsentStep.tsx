import { Box, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { FC } from 'react';
import { BPButton } from './BPButton';
import { SubscriptionConsentStyle } from './style';

const CGU_URL = '#';

interface SubscriptionConsentStepProps {
  onAccept: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const SubscriptionConsentStep: FC<SubscriptionConsentStepProps> = ({ onAccept, onBack, isLoading = false }) => {
  const start = dayjs();
  const commitmentEnd = start.add(1, 'year').subtract(1, 'day');

  return (
    <>
      <DialogTitle sx={{ py: 1.5 }}>Confirmation de votre abonnement</DialogTitle>
      <DialogContent>
        <Box sx={SubscriptionConsentStyle}>
          <Typography className='consent-intro'>
            En confirmant, vous souscrivez à un abonnement avec un engagement de <strong>12 mois</strong> à compter d’aujourd’hui.
          </Typography>
          <Box className='consent-highlight'>
            <Typography className='consent-highlight-label'>Début de l’engagement</Typography>
            <Typography className='consent-highlight-value'>{start.format('DD/MM/YYYY')}</Typography>
            <Typography className='consent-highlight-label'>Fin de l’engagement</Typography>
            <Typography className='consent-highlight-value'>{commitmentEnd.format('DD/MM/YYYY')}</Typography>
          </Box>
          <Typography className='consent-cgu'>
            En cliquant sur « Accepter », vous reconnaissez avoir pris connaissance et accepté les{' '}
            <Link href={CGU_URL} target='_blank' rel='noopener noreferrer'>
              conditions générales d’utilisation
            </Link>
            .
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <BPButton onClick={onBack} label='Retour' colorType='linen' isLoading={isLoading} />
        <BPButton onClick={onAccept} label='Accepter' isLoading={isLoading} />
      </DialogActions>
    </>
  );
};
