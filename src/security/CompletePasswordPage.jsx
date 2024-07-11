import { Button, Typography } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { BP_BUTTON } from '@/bp-theme';
import { BpFormField, BpNumberField } from '@/common/components';
import { completePasswordResolver } from '@/common/resolvers';
import { handleSubmit } from '@/common/utils';
import { authProvider } from '@/providers';

const CompletePasswordForm = () => {
  const form = useForm({ defaultValues: { newPassword: '', confirmedPassword: '', phoneNumber: '' }, mode: 'all', resolver: completePasswordResolver });

  const setNewPasswordSubmit = form.handleSubmit(({ newPassword, phoneNumber }) => {
    authProvider.setNewPassword(newPassword, phoneNumber);
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(setNewPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <Typography component='div' variant='h5'>
          Première connexion ?
        </Typography>
        <br />
        <BpNumberField type='text' label='Numéro de téléphone' name='phoneNumber' />
        <BpFormField type='password' label='Nouveau mot de passe' name='newPassword' />
        <BpFormField type='password' label='Confirmez le mot de passe' name='confirmedPassword' />
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
