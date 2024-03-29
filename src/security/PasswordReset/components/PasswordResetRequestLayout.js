import { Button, Typography, Divider, CircularProgress } from '@mui/material';
import { BpFormField } from '../../../common/components';
import { FormProvider } from 'react-hook-form';
import { BP_BUTTON } from 'src/bp-theme';
import { useForm } from 'react-hook-form';
import { Auth } from 'aws-amplify';
import { useState } from 'react';

const PasswordResetRequestLayout = ({ setStepFunc, handleDialog }) => {
  const [isLoading, setLoading] = useState(false);
  const formState = useForm({ mode: 'all' });

  const handleSubmitRequest = formState.handleSubmit(valueForm => {
    setLoading(true);
    Auth.forgotPassword(valueForm.email)
      .then(data => {
        // mail envoyé avec succès
        handleDialog(true);
        setStepFunc('confirmation', valueForm.email);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  });

  return (
    <>
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
    </>
  );
};

export default PasswordResetRequestLayout;
