import { Button, Typography, CircularProgress } from '@mui/material';
import { BP_BUTTON } from 'src/bp-theme';
import { BpFormField, BpNumberField } from '../../../common/components';
import { FormProvider } from 'react-hook-form';

const PasswordResetConfirmationLayout = ({ formState, handleSubmitConfirmation, isLoading }) => {
  // const formState = useForm({ mode: 'all', defaultValues: { resetCode: '', newpassword: '', confirmPassword: '' } });

  return (
    <FormProvider {...formState}>
      <div style={{ paddingTop: '10%' }}>
        <form style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: 'auto' }} onSubmit={handleSubmitConfirmation}>
          <Typography variant='h6' gutterBottom>
            Réinitialiser votre mot de passe
          </Typography>
          <BpNumberField label='Code de confirmation' name='code' />
          <BpFormField label='Nouveau mot de passe' type='password' name='newpassword' />
          <BpFormField label='Confirmez le mot de passe' type='password' name='confirmedPassword' />

          <Button
            mt={2}
            sx={BP_BUTTON}
            id='confirmation'
            type='submit'
            endIcon={isLoading && <CircularProgress size={20} color='inherit' />}
            disabled={isLoading}
          >
            Confirmer
          </Button>
        </form>
      </div>
    </FormProvider>
  );
};

export default PasswordResetConfirmationLayout;
