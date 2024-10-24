import { Box, Button, Typography } from '@mui/material';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BpFormField } from '@/common/components';
import { useToggle } from '@/common/hooks';
import { handleSubmit } from '@/common/utils';
import { phoneValidator } from '@/operations/account/utils';
import { onboarding } from '@/providers/account-provider';
import { BP_COLOR } from '../bp-theme';
import { DialogSuccessSignUp } from './DialogSuccessSignUp';
import { LOGIN_FORM, LOGIN_FORM_BUTTON } from './style';

export const SignUpForm = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { value: isLoading, handleOpen: startLoading, handleClose: stopLoading } = useToggle();
  const { value: isModalOpen, handleOpen: handleOpenModal, handleClose: handleCloseModal } = useToggle();
  const form = useForm({ mode: 'all' });

  const handleCloseModalWithRedirect = () => {
    handleCloseModal();
    navigate('/login');
  };

  const onSubmit = form.handleSubmit(async data => {
    try {
      startLoading();
      await onboarding([data]);
      handleOpenModal();
    } catch {
      notify('messages.global.error', { type: 'error' });
    } finally {
      stopLoading();
    }
  });

  return (
    <>
      <DialogSuccessSignUp isOpen={isModalOpen} onClose={handleCloseModalWithRedirect} />
      <Box sx={{ ...LOGIN_FORM, alignItems: 'center' }}>
        <img src='/laborer.webp' width={50} height={50} alt='Bienvenue sur BPartners !' />
        <Typography variant='h5' gutterBottom mt={1}>
          Inscription
        </Typography>
        <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <BpFormField label='Nom' name='lastName' form={form} />
            <BpFormField label='Prénom' name='firstName' form={form} />
            <BpFormField label='Adresse mail' name='email' form={form} />
            <BpFormField label='Numéro de téléphone' validate={phoneValidator} name='phoneNumber' form={form} />
            <BpFormField label='Nom de la société' name='companyName' form={form} />
            <Button disabled={isLoading} id='login' type='submit' sx={{ ...LOGIN_FORM_BUTTON, marginTop: 3 }}>
              S'inscrire
            </Button>
          </FormProvider>
        </form>
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
          onClick={() => {
            navigate('/login');
          }}
        >
          <Typography variant='h7' gutterBottom mt={1}>
            Vous avez déjà un compte ? <b>Se connecter</b>
          </Typography>
        </Button>
      </Box>
    </>
  );
};
