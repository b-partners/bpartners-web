import { Box, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import BPFormField from 'src/common/components/BPFormField';
import { phoneValidator } from 'src/operations/account/utils';
import { BP_COLOR } from '../bp-theme.js';
import { LOGIN_FORM, LOGIN_FORM_BUTTON } from './style.js';
import { onboarding } from 'src/providers/account-provider';
import { useNotify } from 'react-admin';
import { useState } from 'react';
import { DialogSuccessSignUp } from './DialogSuccessSignUp.js';

export const SignUpForm = props => {
  const { onSignIn } = props;
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const [isModalOpen, setModalState] = useState(false);
  const form = useForm({ mode: 'all' });

  const handleCloseModal = () => {
    onSignIn();
    setModalState(false);
  };
  const handleOpenModal = () => setModalState(true);

  const onSubmit = async data => {
    try {
      setLoading(true);
      await onboarding([data]);
      handleOpenModal();
    } catch {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogSuccessSignUp isOpen={isModalOpen} onClose={handleCloseModal} />
      <Box sx={{ ...LOGIN_FORM, alignItems: 'center' }}>
        <img src='./laborer.webp' width={50} height={50} alt='Bienvenue sur BPartners !' />
        <Typography variant='h5' gutterBottom mt={1}>
          Inscription
        </Typography>
        <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={form.handleSubmit(onSubmit)}>
          <BPFormField label='Nom' name='lastName' form={form} />
          <BPFormField label='Prénom' name='firstName' form={form} />
          <BPFormField label='Adresse mail' name='email' form={form} />
          <BPFormField label='Numéro de téléphone' validate={phoneValidator} name='phoneNumber' form={form} />
          <BPFormField label='Raison sociale' name='companyName' form={form} />
          <Button disabled={isLoading} id='login' type='submit' sx={{ ...LOGIN_FORM_BUTTON, marginTop: 3 }}>
            S'inscrire
          </Button>
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
          onClick={onSignIn}
        >
          <Typography variant='h7' gutterBottom mt={1}>
            Vous avez déjà un compte ? <b>Se connecter</b>
          </Typography>
        </Button>
      </Box>
    </>
  );
};
