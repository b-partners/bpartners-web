// import { Auth } from 'aws-amplify';
import PasswordResetRequestLayout from './components/PasswordResetRequestLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import PasswordResetConfirmationLayout from './components/PasswordResetConfirmationLayout';
import { useForm } from 'react-hook-form';
import { Auth } from 'aws-amplify';
import { DialogResetCodeSent } from './components/DialogResetCodeSent';

const PasswordResetPage = () => {
  const [step, setStep] = useState('request');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const formState = useForm({ mode: 'all' });
  const navigate = useNavigate();

  const handleSubmitRequest = formState.handleSubmit(valueFrom => {
    setLoading(true);
    Auth.forgotPassword(valueFrom.email)
      .then(data => {
        // mail envoyé avec succès
        setIsOpen(true);
        setStep('confirmation');
        setLoading(false);
        console.log(data);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  });
  const handleSubmitConfirmation = formState.handleSubmit(({ email, code, newpassword }) => {
    console.log('email, code, newpassword', email, code, newpassword);
    setLoading(true);
    Auth.forgotPasswordSubmit(email, code, newpassword)
      .then(data => {
        // La réinitialisation du mot de passe a réussi
        setStep('success');
        setLoading(false);
        console.log('Mot de passe réinitialisé avec succès', data);
      })
      .catch(error => {
        // La réinitialisation du mot de passe a échoué
        console.error('Erreur lors de la réinitialisation du mot de passe', error);
        setLoading(false);
      });
  });
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {step === 'request' ? (
        <PasswordResetRequestLayout formState={formState} handleSubmitRequest={handleSubmitRequest} isLoading={isLoading} />
      ) : step === 'confirmation' ? (
        <PasswordResetConfirmationLayout formState={formState} handleSubmitConfirmation={handleSubmitConfirmation} isLoading={isLoading} />
      ) : step === 'success' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '10%' }}>
          <Typography variant='h6'>
            Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant{' '}
            <Button sx={{ fontWeight: 'bold' }} variant='text' onClick={() => navigate('/login')}>
              vous connecter
            </Button>{' '}
            avec votre nouveau mot de passe.
          </Typography>
        </div>
      ) : null}
      {isOpen ? <DialogResetCodeSent isOpen={isOpen} onClose={onClose} /> : null}
    </>
  );
};

export default PasswordResetPage;
