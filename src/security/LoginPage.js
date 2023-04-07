import { Box, Typography, Button } from '@mui/material';

import { onboardingApi } from '../providers/api';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../common/utils/redirect';

import useAuthentication from 'src/common/hooks/use-authentication';
import BPLoader from 'src/common/components/BPLoader';
import authProvider from 'src/providers/auth-provider';
import { FLEX_CENTER, LOGIN_FORM, LOGIN_FORM_BUTTON } from './style.js';
import { BP_COLOR } from '../bp-theme.js';
import BpBackgroundImage from '../assets/bp-bg-image.png';
import { useForm, FormProvider } from 'react-hook-form';
import { BpFormField } from 'src/common/components';

const BpLoginPage = () => {
  const { isLoading } = useAuthentication();

  return isLoading && authProvider.getCachedWhoami() ? (
    <BPLoader />
  ) : (
    <Box sx={FLEX_CENTER}>
      {<img src='./bp-logo-full.webp' style={{ position: 'absolute', top: '3%', left: '3%', width: '180px' }} alt='Bienvenue sur BPartners !' />}
      <Box sx={{ ...FLEX_CENTER, flexShrink: 0, flexGrow: 1 }}>
        <LoginForm />
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

const LoginForm = () => {
  const onRegistration = () => {
    const initiateOnboarding = async () => {
      const {
        data: { redirectionUrl },
      } = await onboardingApi().initiateOnboarding({ redirectionStatusUrls: loginRedirectionUrls });
      redirect(redirectionUrl);
    };
    initiateOnboarding();
  };

  const formState = useForm({ mode: 'all', defaultValues: { username: '', password: '' } });

  const login = formState.handleSubmit(async loginState => {
    const redirectionUrl = await authProvider.login(loginState);
    redirect(redirectionUrl);
  });

  return (
    <FormProvider {...formState}>
      <form style={LOGIN_FORM} onSubmit={login}>
        <img src='./laborer.webp' width={50} height={50} alt='Bienvenue sur BPartners !' />
        <Typography variant='h5' gutterBottom mt={1}>
          Bienvenue !
        </Typography>
        <BpFormField name='username' label="Nom d'utilisateur" />
        <BpFormField name='password' type='password' label='Mot de passe' />
        <Button id='login' style={{ marginTop: '0.5rem' }} type='submit' onClick={() => {}} sx={LOGIN_FORM_BUTTON}>
          Se connecter
        </Button>
        {/* // TODO(cognito-signup): reactivate when cognito signup is ready
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
          onClick={onRegistration}
        >
          <Typography variant='h7' gutterBottom mt={1}>
            Pas de compte ? <b>C'est par ici</b>
          </Typography>
        </Button>
        */}
      </form>
    </FormProvider>
  );
};

export default BpLoginPage;
