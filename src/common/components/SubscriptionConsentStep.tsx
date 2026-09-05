import { EnableStatus } from '@bpartners/typescript-client';
import { Box, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { BPButton } from './BPButton';
import { SubscriptionConsentStyle } from './style';

const CGU_URL = 'https://www.birdia.fr/conditions-generales-d-utilisation';

interface SubscriptionConsentStepProps {
  onAccept: (automaticRenewalStatus: EnableStatus) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const SubscriptionConsentStep: FC<SubscriptionConsentStepProps> = ({ onAccept, onBack, isLoading = false }) => {
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const start = dayjs();
  const commitmentEnd = start.add(1, 'year').subtract(1, 'day');

  if (isConfirming) {
    return (
      <>
        <DialogTitle sx={{ py: 1.5 }}>Confirmez votre choix</DialogTitle>
        <DialogContent>
          <Box sx={SubscriptionConsentStyle}>
            <Typography className='consent-intro'>
              Vous êtes sur le point de vous engager pour <strong>12 mois</strong>
              {autoRenewal ? ' avec renouvellement automatique' : ' sans renouvellement automatique'}. Confirmez-vous votre choix ?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <BPButton onClick={() => setIsConfirming(false)} label='Annuler' colorType='linen' disabled={isLoading} />
          <BPButton onClick={() => onAccept(autoRenewal ? EnableStatus.ENABLED : EnableStatus.DISABLED)} label='Confirmer' isLoading={isLoading} />
        </DialogActions>
      </>
    );
  }

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
          <FormControlLabel
            className='consent-auto-renewal'
            control={<Checkbox checked={autoRenewal} onChange={(_, checked) => setAutoRenewal(checked)} />}
            label='Renouveler automatiquement mon abonnement, peut être annulé à tout moment'
          />
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
        <BPButton onClick={() => setIsConfirming(true)} label='Accepter' isLoading={isLoading} />
      </DialogActions>
    </>
  );
};
