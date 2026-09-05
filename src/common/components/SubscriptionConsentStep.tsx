import { formatEuros } from '@/operations/account/components/billing/utils';
import { EnableStatus, SubscriptionPlan } from '@bpartners/typescript-client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { FC, useState } from 'react';
import { BPButton } from './BPButton';
import { SubscriptionConsentStyle } from './style';

const CGU_URL = 'https://www.birdia.fr/conditions-generales-d-utilisation';

const AUTO_WIDTH = { width: 'auto' };

const COMMITMENT_MONTHS = 12;

const formatMonth = (date: dayjs.Dayjs) => date.locale('fr').format('MMMM YYYY');

interface SubscriptionConsentStepProps {
  plan?: SubscriptionPlan;
  onAccept: (automaticRenewalStatus: EnableStatus) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const SubscriptionConsentStep: FC<SubscriptionConsentStepProps> = ({ plan, onAccept, onBack, isLoading = false }) => {
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const startMonth = formatMonth(dayjs());
  const endMonth = formatMonth(dayjs().add(COMMITMENT_MONTHS - 1, 'month'));

  if (isConfirming) {
    return (
      <>
        <DialogTitle className='subscription-step-title'>
          <Box className='subscription-step-title-icon'>
            <HelpOutlineRoundedIcon />
          </Box>
          <Box className='subscription-step-title-text'>
            <Typography component='span' className='subscription-step-title-main'>
              Confirmez votre choix
            </Typography>
            <Typography component='span' className='subscription-step-title-hint'>
              Dernière étape avant le paiement sécurisé
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={SubscriptionConsentStyle}>
            <Box className='consent-confirm'>
              <Typography className='consent-confirm-text'>
                Vous êtes sur le point de vous engager pour <strong>12 mois</strong>.
              </Typography>
              <Box className='consent-recap'>
                {plan && (
                  <Box className='consent-recap-plan'>
                    <Box className='consent-recap-plan-header'>
                      <Typography className='consent-recap-plan-name'>{plan.name}</Typography>
                      <Box className='consent-recap-plan-price'>
                        <Typography className='consent-recap-plan-amount'>{formatEuros(plan.priceInCentsWithoutVat)}</Typography>
                        <Typography className='consent-recap-plan-period'>HT / mois</Typography>
                      </Box>
                      {!!plan.priceInCentsWithVat && (
                        <Typography className='consent-recap-plan-vat'>{`Soit ${formatEuros(plan.priceInCentsWithVat)} TTC / mois`}</Typography>
                      )}
                    </Box>
                    {!!plan.features?.length && (
                      <Box component='ul' className='consent-recap-features'>
                        {plan.features.map(feature => (
                          <Box component='li' key={feature} className='consent-recap-feature'>
                            <CheckRoundedIcon />
                            {feature}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
                <Box className='consent-recap-row'>
                  <Typography className='consent-recap-label'>Période</Typography>
                  <Typography className='consent-recap-value consent-recap-value--period'>
                    {startMonth} → {endMonth}
                  </Typography>
                </Box>
                <Box className='consent-recap-row'>
                  <Typography className='consent-recap-label'>Renouvellement automatique</Typography>
                  <Typography className='consent-recap-value'>{autoRenewal ? 'Activé' : 'Désactivé'}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className='subscription-step-actions'>
          <Button className='subscription-step-button subscription-step-button--ghost' onClick={() => setIsConfirming(false)} disabled={isLoading}>
            Annuler
          </Button>
          <BPButton
            className='subscription-step-button'
            style={AUTO_WIDTH}
            onClick={() => onAccept(autoRenewal ? EnableStatus.ENABLED : EnableStatus.DISABLED)}
            label='Confirmer'
            isLoading={isLoading}
          />
        </DialogActions>
      </>
    );
  }

  return (
    <>
      <DialogTitle className='subscription-step-title'>
        <Box className='subscription-step-title-icon'>
          <EventAvailableRoundedIcon />
        </Box>
        <Box className='subscription-step-title-text'>
          <Typography component='span' className='subscription-step-title-main'>
            Confirmation de votre abonnement
          </Typography>
          <Typography component='span' className='subscription-step-title-hint'>
            Engagement annuel, facturation mensuelle
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={SubscriptionConsentStyle}>
          <Typography className='consent-intro'>
            En confirmant, vous souscrivez à un abonnement avec un engagement de <strong>12 mois</strong> à compter de ce mois-ci.
          </Typography>

          <Box className='consent-timeline'>
            <Box className='consent-date'>
              <Typography className='consent-date-label'>Début de l’engagement</Typography>
              <Typography className='consent-date-value'>{startMonth}</Typography>
            </Box>
            <Box className='consent-date consent-date--end'>
              <Typography className='consent-date-label'>Fin de l’engagement</Typography>
              <Typography className='consent-date-value'>{endMonth}</Typography>
            </Box>
          </Box>

          <Box className={`consent-option${autoRenewal ? ' consent-option--checked' : ''}`}>
            <FormControlLabel
              control={<Checkbox checked={autoRenewal} onChange={(_, checked) => setAutoRenewal(checked)} />}
              label='Renouveler automatiquement mon abonnement'
            />
            <Typography className='consent-option-hint'>Le renouvellement peut être désactivé avant la fin de l’engagement.</Typography>
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
      <DialogActions className='subscription-step-actions'>
        <Button className='subscription-step-button subscription-step-button--ghost' onClick={onBack} disabled={isLoading}>
          Retour
        </Button>
        <BPButton className='subscription-step-button' style={AUTO_WIDTH} onClick={() => setIsConfirming(true)} label='Accepter' isLoading={isLoading} />
      </DialogActions>
    </>
  );
};
