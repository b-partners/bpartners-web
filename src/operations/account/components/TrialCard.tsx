import { UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import { Card, CardContent, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';

const PARIS_TIME_ZONE = 'Europe/Paris';

const formatParisDate = (date: Date) => date.toLocaleDateString('fr-FR', { timeZone: PARIS_TIME_ZONE });

const getSubscriptionCommitmentEndDate = (subscriptionStart: Date) => {
  const end = new Date(subscriptionStart);
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  end.setUTCDate(end.getUTCDate() - 1);
  return end;
};

export const TrialCard = () => {
  const record = useRecordContext();
  const subscription: UserSubscription = record?.user?.subscription;

  const isFreeTrial = subscription?.status === UserSubscriptionStatus.FREE_TRIAL;
  const isActive = subscription?.status === UserSubscriptionStatus.ACTIVE;

  const subscriptionStart = new Date(subscription?.start);
  const subscriptionTrialEnd = new Date(subscription?.end);
  const subscriptionCommitmentEnd = getSubscriptionCommitmentEndDate(subscriptionStart);

  const periodEnd = isFreeTrial ? subscriptionTrialEnd : subscriptionCommitmentEnd;

  return (
    <Card className='card card-trial'>
      <CardContent>
        <Typography className='section-title'>{isFreeTrial ? "Période d'essai" : 'Période de votre abonnement'}</Typography>
        {isActive || isFreeTrial ? (
          <>
            {isFreeTrial && <Typography className='trial-desciption'>Vous bénéficiez actuellement d’une période d’essai gratuite.</Typography>}
            <Typography className='trial-start'>
              {isFreeTrial ? 'Début de la période d’essai' : 'Début de votre abonnement'} : {formatParisDate(subscriptionStart)}
            </Typography>
            <Typography className='trial-end'>
              {isFreeTrial ? 'Fin de la période d’essai' : 'Fin de votre abonnement'} : {formatParisDate(periodEnd)}
            </Typography>
          </>
        ) : (
          <Typography className='not-try'>Pas de période d’essai en cours.</Typography>
        )}
      </CardContent>
    </Card>
  );
};
