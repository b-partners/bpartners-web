import { SubscriptionPlan } from '@bpartners/typescript-client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FC } from 'react';
import { BPButton } from './BPButton';
import { SubscriptionTrialStyle } from './style';

const AUTO_WIDTH = { width: 'auto' };

interface SubscriptionTrialStepProps {
  plan?: SubscriptionPlan;
  hasCard: boolean;
  onConfirm: () => void;
  onAddCard: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const SubscriptionTrialStep: FC<SubscriptionTrialStepProps> = ({ plan, hasCard, onConfirm, onAddCard, onBack, isLoading = false }) => (
  <>
    <DialogTitle className='subscription-step-title'>
      <Box className='subscription-step-title-icon'>
        <RocketLaunchRoundedIcon />
      </Box>
      <Box className='subscription-step-title-text'>
        <Typography component='span' className='subscription-step-title-main'>
          Démarrez votre essai gratuit
        </Typography>
        <Typography component='span' className='subscription-step-title-hint'>
          {plan?.trialPeriodDays ? `${plan.trialPeriodDays} jours pour tester l'abonnement ${plan.name ?? ''}`.trim() : `Testez ${plan?.name ?? ''}`.trim()}
        </Typography>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={SubscriptionTrialStyle}>
        <Box className='trial-highlight'>
          <LockRoundedIcon />
          <Typography className='trial-highlight-text'>Aucun débit ne sera effectué pendant toute la durée de votre essai.</Typography>
        </Box>
        <Box component='ul' className='trial-points'>
          <Box component='li' className='trial-point'>
            <CreditCardRoundedIcon />
            {hasCard
              ? 'Votre carte enregistrée ne sera utilisée qu’à la fin de l’essai, uniquement si vous décidez de continuer.'
              : "Une carte est nécessaire pour démarrer votre essai. Vous ne serez débité qu’à la fin de l'essai, si vous décidez de continuer."}
          </Box>
          <Box component='li' className='trial-point'>
            <CheckRoundedIcon />
            Vous pouvez arrêter à tout moment avant la fin de l’essai, sans aucun frais.
          </Box>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions className='subscription-step-actions'>
      <Button className='subscription-step-button subscription-step-button--ghost' onClick={onBack} disabled={isLoading}>
        Retour
      </Button>
      <BPButton
        className='subscription-step-button'
        style={AUTO_WIDTH}
        onClick={hasCard ? onConfirm : onAddCard}
        label={hasCard ? 'Démarrer mon essai gratuit' : 'Ajouter ma carte'}
        isLoading={isLoading}
      />
    </DialogActions>
  </>
);
