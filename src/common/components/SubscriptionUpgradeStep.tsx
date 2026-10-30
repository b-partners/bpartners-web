import { SubscriptionUpgrade, SubscriptionUpgradeStatus } from '@bpartners/typescript-client';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import LockClockRoundedIcon from '@mui/icons-material/LockClockRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { FC, ReactNode } from 'react';
import { BPButton } from './BPButton';
import { SubscriptionUpgradeStyle } from './style';
import { SubscriptionUpgradeSummary } from './SubscriptionUpgradeSummary';

const AUTO_WIDTH = { width: 'auto' };

type UpgradeTone = 'info' | 'warning' | 'success' | 'error';

interface UpgradeContent {
  tone: UpgradeTone;
  icon: ReactNode;
  title: string;
  message: string;
}

const formatDeadline = (date?: Date | string | null) => (date ? dayjs(date).format('DD/MM/YYYY [à] HH:mm') : '');

const getContent = ({ status }: SubscriptionUpgrade): UpgradeContent => {
  switch (status) {
    case SubscriptionUpgradeStatus.AWAITING_PAYMENT:
      return {
        tone: 'warning',
        icon: <LockClockRoundedIcon />,
        title: 'Une validation de votre paiement est nécessaire',
        message:
          'Votre banque doit confirmer le règlement du montant ci-dessous. Votre abonnement actuel reste actif tant que le paiement n’est pas finalisé ; la mise à niveau sera appliquée automatiquement dès sa confirmation.',
      };
    case SubscriptionUpgradeStatus.PAID:
      return {
        tone: 'success',
        icon: <CheckCircleOutlineRoundedIcon />,
        title: 'Votre abonnement a été mis à niveau',
        message: 'Le paiement est confirmé et votre nouvelle offre est active. Votre avoir et votre nouvelle facture vous seront envoyés sous peu.',
      };
    case SubscriptionUpgradeStatus.INVOICED:
      return {
        tone: 'success',
        icon: <CheckCircleOutlineRoundedIcon />,
        title: 'Votre abonnement a été mis à niveau',
        message: 'Le paiement est confirmé et votre nouvelle offre est active. Votre avoir et votre nouvelle facture ont été émis.',
      };
    case SubscriptionUpgradeStatus.EXPIRED:
      return {
        tone: 'error',
        icon: <ErrorOutlineRoundedIcon />,
        title: 'Le paiement n’a pas été effectué à temps',
        message:
          'Le délai de paiement est dépassé : la demande a été annulée et votre abonnement précédent reste inchangé. Vous pouvez relancer un changement d’offre.',
      };
    case SubscriptionUpgradeStatus.ABANDONED:
      return {
        tone: 'info',
        icon: <ErrorOutlineRoundedIcon />,
        title: 'Changement d’offre abandonné',
        message: 'Votre abonnement actuel reste inchangé. Vous pouvez relancer un changement d’offre à tout moment.',
      };
    default:
      return {
        tone: 'info',
        icon: <AutorenewRoundedIcon />,
        title: 'Votre changement d’offre est en cours de traitement',
        message:
          'Votre demande a bien été prise en compte. Votre nouvelle offre sera active dans quelques instants. Si elle n’apparaît pas rapidement, contactez le support.',
      };
  }
};

interface SubscriptionUpgradeStepProps {
  upgrade: SubscriptionUpgrade;
  onBackToPlans: () => void;
  onDone: () => void;
  onPay: (paymentUrl: string) => void;
  onAbandon: () => void;
  isAbandoning?: boolean;
}

export const SubscriptionUpgradeStep: FC<SubscriptionUpgradeStepProps> = ({ upgrade, onBackToPlans, onDone, onPay, onAbandon, isAbandoning = false }) => {
  const { status, paymentUrl, paymentExpirationDatetime } = upgrade;
  const { tone, icon, title, message } = getContent(upgrade);
  const isAwaitingPayment = status === SubscriptionUpgradeStatus.AWAITING_PAYMENT;
  const isExpired = status === SubscriptionUpgradeStatus.EXPIRED || status === SubscriptionUpgradeStatus.ABANDONED;
  const canPay = isAwaitingPayment && !!paymentUrl;
  const deadline = isAwaitingPayment ? formatDeadline(paymentExpirationDatetime) : '';

  return (
    <>
      <DialogContent>
        <Box sx={SubscriptionUpgradeStyle} data-cy={`subscription-upgrade-${status}`}>
          <Box className={`upgrade-banner upgrade-banner--${tone}`}>
            {icon}
            <Box>
              <Typography className='upgrade-banner-title'>{title}</Typography>
              <Typography className='upgrade-banner-message'>{message}</Typography>
            </Box>
          </Box>
          {!!deadline && (
            <Typography className='upgrade-deadline'>
              <ScheduleRoundedIcon />
              {`À payer avant le ${deadline}`}
            </Typography>
          )}
          <SubscriptionUpgradeSummary upgrade={upgrade} />
        </Box>
      </DialogContent>
      <DialogActions className='subscription-step-actions'>
        {isExpired && (
          <BPButton className='subscription-step-button' style={AUTO_WIDTH} onClick={onBackToPlans} label='Choisir une offre' name='upgrade-retry' />
        )}
        {isAwaitingPayment && (
          <>
            <Button className='subscription-step-button subscription-step-button--ghost' onClick={onDone} disabled={isAbandoning} name='upgrade-later'>
              Plus tard
            </Button>
            <Button className='subscription-step-button subscription-step-button--ghost' onClick={onAbandon} disabled={isAbandoning} name='upgrade-abandon'>
              Abandonner
            </Button>
            {canPay && (
              <BPButton
                className='subscription-step-button'
                style={AUTO_WIDTH}
                onClick={() => onPay(paymentUrl!)}
                label='Finaliser le paiement'
                isLoading={isAbandoning}
                name='upgrade-pay'
              />
            )}
          </>
        )}
        {!isExpired && !isAwaitingPayment && (
          <BPButton className='subscription-step-button' style={AUTO_WIDTH} onClick={onDone} label='Terminer' name='upgrade-done' />
        )}
      </DialogActions>
    </>
  );
};
