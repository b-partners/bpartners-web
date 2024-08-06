import { BP_BUTTON } from '@/bp-theme';
import { awsAuth } from '@/providers';
import { Button, CircularProgress, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField } from '../../../common/components';

const PasswordResetRequestLayout = ({ setStepFunc, handleDialog }) => {
  const [isLoading, setIsLoading] = useState(false);
  const formState = useForm({ mode: 'all' });

  const handleSubmitRequest = formState.handleSubmit(({ email }) => {
    setIsLoading(true);
    awsAuth
      .resetPassword({ username: email })
      .then(data => {
        // mail envoyé avec succès
        handleDialog(true);
        setStepFunc('confirmation', email);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
      });
  });

  return (
    <FormProvider {...formState}>
      <div style={{ paddingTop: '10%' }}>
        <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: 'auto' }}>
          <Typography variant='h5' gutterBottom mt={1}>
            Mot de passe oublié ?
          </Typography>
          <Typography variant='body2' gutterBottom mt={1}>
            Renseignez l'adresse mail associée à votre compte, puis cliquez sur continuer. Nous vous enverrons par e-mail un code de validation qui vous
            permettra de réinitialiser votre mot de passe.
          </Typography>
          <BpFormField label='Votre adresse mail' type='email' name='email' />
          <Button
            sx={BP_BUTTON}
            id='sendMail_resetPassword'
            style={{ marginTop: '0.5rem' }}
            type='submit'
            endIcon={isLoading && <CircularProgress size={20} color='inherit' />}
            disabled={isLoading}
          >
            Continuer
          </Button>
          <Divider />
        </form>
      </div>
    </FormProvider>
  );
};

export default PasswordResetRequestLayout;
