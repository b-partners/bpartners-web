import { Card, CardContent, Typography } from '@mui/material';

export const TrialCard = () => {
  return (
    <Card className='card card-trial'>
      <CardContent>
        <Typography className='section-title'>Période d’essai</Typography>
        <Typography sx={{ fontStyle: 'italic', mb: 1.5 }}>Vous bénéficiez actuellement d’une période d’essai gratuite.</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>Début de la période d’essai : 26/06/2025</Typography>
        <Typography sx={{ mt: 2.5, fontWeight: 'bold' }}>Fin de la période d’essai : 10/07/2025</Typography>
      </CardContent>
    </Card>
  );
};
