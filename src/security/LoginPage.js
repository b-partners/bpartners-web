import { Box, Button, CircularProgress, Typography } from '@mui/material';

import { redirect } from '../common/utils';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { BP_COLOR } from 'src/bp-theme';
import { BpFormField } from 'src/common/components';
import BPLoader from 'src/common/components/BPLoader';
import useAuthentication from 'src/common/hooks/use-authentication';
import { handleSubmit } from 'src/common/utils';
import { authProvider } from 'src/providers';
import BpBackgroundImage from '../assets/bp-bg-image.png';
import CompletePasswordPage from './CompletePasswordPage';
import { SignUpForm } from './SignUpForm';
import { FLEX_CENTER, LOGIN_FORM, LOGIN_FORM_BUTTON } from './style.js';

const BpLoginPage = () => {
  const { isLoading } = useAuthentication();
  const [isLogin, setFormState] = useState(true);

  const toggleForm = () => setFormState(!isLogin);

  return isLoading && authProvider.getCachedWhoami() ? (
    <BPLoader message="Chargement des informations d'authentification, veuillez patienter..." />
  ) : (
    <Box sx={FLEX_CENTER}>
      {<img src='/bp-logo-full.webp' style={{ position: 'absolute', top: '3%', left: '3%', width: '180px' }} alt='Bienvenue sur BPartners !' />}
      <Box sx={{ ...FLEX_CENTER, flexShrink: 0, flexGrow: 1 }}>
        {isLogin ? <PasswordChangeableLogin onSignUp={toggleForm} /> : <SignUpForm onSignIn={toggleForm} />}
      </Box>
      <Box
        width={{ md: '60%', sm: '0%', xs: '0%' }}
        sx={{
          ...FLEX_CENTER,
          height: '110vh',
          backgroundImage: `url(${BpBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }}
      >
        <Typography
          sx={{
            color: '#F5F5F5',
            fontStyle: 'italic',
            position: 'absolute',
            bottom: '6.5rem',
          }}
        >
          L'assistant intelligent qui accélère la croissance des artisans et indépendants.
        </Typography>
      </Box>
    </Box>
  );
};

const SignInForm = ({ onSignUp }) => {
  const formState = useForm({ mode: 'all', defaultValues: { username: '', password: '' } });
  const [isLoading, setLoading] = useState(false);

  const login = formState.handleSubmit(async loginState => {
    setLoading(true);
    const redirectionUrl = await authProvider.login(loginState);
    redirect(redirectionUrl);
  });

  return (
    <FormProvider {...formState}>
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
          id='register'
          sx={{
            backgroundColor: 'transparent',
            color: '#000',
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
          onClick={onSignUp}
        >
          <Typography variant='h7' gutterBottom mt={1}>
            Pas de compte ? <b>C'est par ici</b>
          </Typography>
        </Button>
      </form>
    </FormProvider>
  );
};

const ResponsiveCompletePassword = () => <CompletePasswordPage style={{ backgroundImage: 'inherit' }} />;
const PasswordChangeableLogin = ({ onSignUp }) => (authProvider.isTemporaryPassword() ? <ResponsiveCompletePassword /> : <SignInForm onSignUp={onSignUp} />);

export default BpLoginPage;
