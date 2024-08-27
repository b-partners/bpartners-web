import { PasswordResolver } from '@/common/resolvers/reset-password-validator';
import { FieldErrorMessage } from '@/common/resolvers/utils';
import { awsAuth } from '@/providers';
import { Button, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField, BpNumberField } from '../../../common/components';

const PasswordResetConfirmationLayout = ({ setStepFunc, email }) => {
  const [isLoading, setLoading] = useState(false);
  const formState = useForm({ mode: 'all', resolver: PasswordResolver });

  const handleSubmitConfirmation = formState.handleSubmit(values => {
    setLoading(true);
    const { resetCode, newPassword } = values;
    awsAuth
      .confirmResetPassword({ confirmationCode: resetCode, newPassword, username: email })
      .then(data => {
        // La réinitialisation du mot de passe a réussi
        setStepFunc('success');
        setLoading(false);
      })
      .catch(error => {
        // La réinitialisation du mot de passe a échoué
        formState.setError('resetCode', { message: FieldErrorMessage.resetCode });
        setLoading(false);
      });
  });

  return (
    <FormProvider {...formState}>
      <div style={{ paddingTop: '10%' }}>
        <form style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: 'auto' }} onSubmit={handleSubmitConfirmation}>
          <Typography variant='h6' gutterBottom>
            Réinitialiser votre mot de passe
          </Typography>
          <BpNumberField label='Code de confirmation' name='resetCode' />
          <BpFormField label='Nouveau mot de passe' type='password' name='newPassword' />
          <BpFormField label='Confirmez le mot de passe' type='password' name='confirmedPassword' />
          <Button mt={2} id='confirmation' type='submit' endIcon={isLoading && <CircularProgress size={20} color='inherit' />} disabled={isLoading}>
            Confirmer
          </Button>
        </form>
      </div>
    </FormProvider>
  );
};

export default PasswordResetConfirmationLayout;
