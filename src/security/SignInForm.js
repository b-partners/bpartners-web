import { Button, CircularProgress, Typography, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authProvider } from 'src/providers';
import { BP_COLOR } from '../bp-theme';
import { BpFormField } from '../common/components';
import { handleSubmit } from '../common/utils';
import { redirect } from '../common/utils';
import CompletePasswordPage from './CompletePasswordPage';
import { LOGIN_FORM, LOGIN_FORM_BUTTON } from './style';
import DownloadAppBanner from './DownloadAppBanner';

const SignInForm = () => {
  const formState = useForm({ mode: 'all', defaultValues: { username: '', password: '' } });
  const [isLoading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const login = formState.handleSubmit(async loginState => {
    setLoading(true);
    const redirectionUrl = await authProvider.login(loginState);
    redirect(redirectionUrl);
  });

  const navigate = useNavigate();

  // Fonction pour mettre à jour la largeur de la fenêtre lors du redimensionnement
  const updateWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  // Utilisez useEffect pour ajouter un gestionnaire d'événements de redimensionnement
  useEffect(() => {
    window.addEventListener('resize', updateWindowWidth);

    // Nettoyez le gestionnaire d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  return (
    <FormProvider {...formState}>
      {windowWidth <= 1000 ? (
        <DownloadAppBanner />
      ) : (
        <form style={LOGIN_FORM} onSubmit={handleSubmit(login)}>
          <img src='/laborer.webp' width={50} height={50} alt='Bienvenue sur BPartners !' />
          <Typography variant='h5' gutterBottom mt={1}>
            Bienvenue !
          </Typography>
          <BpFormField name='username' label='Votre email' />
          <BpFormField name='password' type='password' label='Mot de passe' />
          <Button
            id='login'
            endIcon={isLoading && <CircularProgress size={20} color='inherit' />}
            disabled={isLoading}
            style={{ marginTop: '0.5rem' }}
            type='submit'
            sx={LOGIN_FORM_BUTTON}
          >
            Se connecter
          </Button>
          <Button
            id='passwordReset'
            sx={{
              backgroundColor: 'transparent',
              color: '#000000',
              textTransform: 'none',
              textAlign: 'left',
              mt: 2,
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
                color: BP_COLOR[20],
              },
            }}
            onClick={() => {
              navigate('/password/reset');
            }}
          >
            <Typography variant='h7' gutterBottom>
              Mot de passe oublié ?
            </Typography>
          </Button>
          <Divider />
          <Button
            id='register'
            sx={{
              backgroundColor: 'transparent',
              color: '#000000',
              textTransform: 'none',
              textAlign: 'left',
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
                color: BP_COLOR[20],
              },
            }}
            onClick={() => {
              navigate('/sign-up');
            }}
          >
            <Typography variant='h7' gutterBottom mt={1}>
              Pas de compte ? <b>C'est par ici</b>
            </Typography>
          </Button>
        </form>
      )}
    </FormProvider>
  );
};

const ResponsiveCompletePassword = () => <CompletePasswordPage style={{ backgroundImage: 'inherit' }} />;
export const PasswordChangeableLogin = () => {
  return authProvider.isTemporaryPassword() ? <ResponsiveCompletePassword /> : <SignInForm />;
};
