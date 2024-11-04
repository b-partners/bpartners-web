import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

export const PasswordResetPassword = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '10%' }}>
      <Typography variant='h6'>
        Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant{' '}
        <Button id='redirect-button-to-login' sx={{ fontWeight: 'bold' }} variant='text' onClick={() => navigate('/login')}>
          vous connecter
        </Button>
        avec votre nouveau mot de passe.
      </Typography>
    </div>
  );
};
