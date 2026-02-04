import { UserSubscription, UserSubscriptionStatus } from '@bpartners/typescript-client';
import { Card, CardContent, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';

export const TrialCard = () => {
  const record = useRecordContext();
  const subscription: UserSubscription = record?.user?.subscription;

  const isFreeTrial = subscription?.status === UserSubscriptionStatus.FREE_TRIAL;

  return (
    <Card className='card card-trial'>
      <CardContent>
        <Typography className='section-title'>Période d’essai</Typography>
        {subscription?.status === 'ACTIVE' ? (
          <>
            {isFreeTrial && <Typography className='trial-desciption'>Vous bénéficiez actuellement d’une période d’essai gratuite.</Typography>}
            <Typography className='trial-start'>
              {isFreeTrial ? 'Début de la période d’essai' : 'Début de votre abonnement'} : {new Date(subscription.start).toLocaleDateString()}
            </Typography>
            <Typography className='trial-end'>
              {isFreeTrial ? 'Fin de la période d’essai' : 'Fin de votre abonnement'} : {new Date(subscription.end).toLocaleDateString()}
            </Typography>
          </>
        ) : (
          <Typography className='not-try'>Pas de période d’essai en cours.</Typography>
        )}
      </CardContent>
    </Card>
  );
};
