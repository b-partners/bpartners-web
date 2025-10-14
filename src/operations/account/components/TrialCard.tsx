import { Card, CardContent, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';

export const TrialCard = () => {
  const record = useRecordContext();
  const subscription = record?.user?.subscription;

  return (
    <Card className='card card-trial'>
      <CardContent>
        <Typography className='section-title'>Période d’essai</Typography>
        {subscription?.status === 'ACTIVE' ? (
          <>
            <Typography className='trial-desciption'>Vous bénéficiez actuellement d’une période d’essai gratuite.</Typography>
            <Typography className='trial-start'>Début de la période d’essai : {subscription.start}</Typography>
            <Typography className='trial-end'>Fin de la période d’essai : {subscription.end}</Typography>
          </>
        ) : (
          <Typography className='not-try'>Pas de période d’essai en cours.</Typography>
        )}
      </CardContent>
    </Card>
  );
};
