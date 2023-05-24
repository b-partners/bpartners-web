import { Button, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authProvider } from 'src/providers';
import { BP_COLOR } from '../bp-theme';
import { BpFormField } from '../common/components';
import { handleSubmit } from '../common/utils';
import { redirect } from '../common/utils';
import CompletePasswordPage from './CompletePasswordPage';
import { LOGIN_FORM, LOGIN_FORM_BUTTON } from './style';

const SignInForm = () => {
  const formState = useForm({ mode: 'all', defaultValues: { username: '', password: '' } });
  const [isLoading, setLoading] = useState(false);

  const login = formState.handleSubmit(async loginState => {
    setLoading(true);
    const redirectionUrl = await authProvider.login(loginState);
    redirect(redirectionUrl);
  });

  const navigate = useNavigate();

  return (
    <FormProvider {...formState}>
      <form style={LOGIN_FORM} onSubmit={handleSubmit(login)}>
        <img src='./laborer.webp' width={50} height={50} alt='Bienvenue sur BPartners !' />
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
            navigate('/sign-up');
          }}
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
export const PasswordChangeableLogin = () => {
  return authProvider.isTemporaryPassword() ? <ResponsiveCompletePassword /> : <SignInForm />;
};
