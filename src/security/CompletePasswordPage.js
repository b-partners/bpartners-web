import authProvider from 'src/providers/auth-provider';

import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { BpFormField } from 'src/common/components';
import { Button, Typography } from '@mui/material';
import { BP_BUTTON } from 'src/bp-theme';

const CompletePasswordForm = () => {
  const form = useForm({ defaultValues: { newPassword: '', confirmedPassword: '' }, mode: 'all' });
  const { newPassword } = useWatch({ control: form.control });

  const matchCognitoPassword = password => {
    var format = /[!@#$%^&*()_+\-=]/;
    if (password.length < 8) {
      return false;
    } else if (!format.test(password)) {
      return false;
    } else if (!/\d/.test(password)) {
      return false;
    } else if (!/[A-Z]/.test(password)) {
      return false;
    }
    return true;
  };

  const handleSubmit = form.handleSubmit(passwords => {
    authProvider.setNewPassword(passwords.newPassword);
  });

  const passwordValidator = passwordValue => {
    if (passwordValue === '') {
      return 'Le mot de passe ne peut pas être vide.';
    } else if (!matchCognitoPassword(passwordValue)) {
      return 'Le mot de passe doit : \n - avoir au moins 8 caractères \n - avoir au moins une majuscule \n - avoir au moins un caractère spécial !@#$%^&*()_+-= \n - avoir au moins un chiffre';
    }
    return true;
  };

  const confirmPassValidator = passwordConfirmation => {
    if (passwordConfirmation !== newPassword) {
      return 'Les mots de passe ne correspondent pas !';
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <Typography component='div' variant='h5'>
          Première connexion ?
        </Typography>
        <br />
        <BpFormField validate={passwordValidator} type='password' label='Nouveau mot de passe' name='newPassword' />
        <BpFormField validate={confirmPassValidator} type='password' label='Confirmez le mot de passe' name='confirmedPassword' />
        <br />
        <Button mt={2} sx={BP_BUTTON} type='submit'>
          Enregistrer
        </Button>
      </form>
    </FormProvider>
  );
};

const CompletePasswordPage = () => {
  return (
    <center style={{ paddingTop: '10%' }}>
      <CompletePasswordForm />
    </center>
  );
};
export default CompletePasswordPage;
