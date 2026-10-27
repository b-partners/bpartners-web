import { SubscriptionUpgrade } from '@bpartners/typescript-client';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import { Alert, Box, Button, DialogActions, DialogContent, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { FC } from 'react';
import { BPButton } from './BPButton';
import { SubscriptionUpgradeStyle } from './style';
import { SubscriptionUpgradeSummary } from './SubscriptionUpgradeSummary';

const AUTO_WIDTH = { width: 'auto' };

const formatDeadline = (date?: Date | string | null) => (date ? dayjs(date).format('DD/MM/YYYY [à] HH:mm') : '');

interface SubscriptionUpgradeConfirmStepProps {
  upgrade: SubscriptionUpgrade;
  onAbandon: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
  isAbandoning?: boolean;
  isChargeFailed?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const SubscriptionUpgradeConfirmStep: FC<SubscriptionUpgradeConfirmStepProps> = ({
  upgrade,
  onAbandon,
  onConfirm,
  isConfirming = false,
  isAbandoning = false,
  isChargeFailed = false,
  hasError = false,
  errorMessage,
}) => {
  const deadline = formatDeadline(upgrade.quoteExpirationDatetime);

  return (
    <>
      <DialogContent>
        <Box sx={SubscriptionUpgradeStyle} data-cy='subscription-upgrade-confirm'>
          <Box className='upgrade-banner upgrade-banner--info'>
            <SwapVertRoundedIcon />
            <Box>
              <Typography className='upgrade-banner-title'>Récapitulatif de votre changement d’offre</Typography>
              <Typography className='upgrade-banner-message'>
                Rien n’est débité à ce stade. Vérifiez le montant et son calcul, puis finalisez ou abandonnez. Si votre banque demande une validation, vous
                serez redirigé vers la page de paiement sécurisée.
              </Typography>
            </Box>
          </Box>
          {!!deadline && (
            <Typography className='upgrade-deadline'>
              <ScheduleRoundedIcon />
              {`Récapitulatif valable jusqu’au ${deadline}`}
            </Typography>
          )}
          {isChargeFailed && (
            <Alert severity='warning' variant='filled'>
              Le prélèvement n’a pas abouti. Vérifiez votre moyen de paiement puis réessayez.
            </Alert>
          )}
          {hasError && (
            <Alert severity='error' variant='filled'>
              {errorMessage ?? 'Une erreur s’est produite.'}
            </Alert>
          )}
          <SubscriptionUpgradeSummary upgrade={upgrade} />
        </Box>
      </DialogContent>
      <DialogActions className='subscription-step-actions'>
        <Button
          className='subscription-step-button subscription-step-button--ghost'
          onClick={onAbandon}
          disabled={isConfirming || isAbandoning}
          name='upgrade-abandon'
        >
          Abandonner
        </Button>
        <BPButton
          className='subscription-step-button'
          style={AUTO_WIDTH}
          onClick={onConfirm}
          label='Finaliser'
          isLoading={isConfirming}
          disabled={isAbandoning}
          name='upgrade-confirm'
        />
      </DialogActions>
    </>
  );
};
