// import { Auth } from 'aws-amplify';
import PasswordResetRequestLayout from './components/PasswordResetRequestLayout';
import { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import PasswordResetConfirmationLayout from './components/PasswordResetConfirmationLayout';
import { DialogResetCodeSent } from './components/DialogResetCodeSent';
import { redirect } from 'src/common/utils';

const PasswordResetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');

  const setStepFunc = (step, email) => {
    setStep(step);
    setEmail(email);
  };
  const handleDialog = value => {
    setIsOpen(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (step === 'success') {
        redirect('/login');
      }
      return () => {
        clearTimeout(timeoutId);
      };
    }, 5000);
  });

  return (
    <>
      {step === 'request' ? (
        <PasswordResetRequestLayout setStepFunc={setStepFunc} handleDialog={handleDialog} />
      ) : step === 'confirmation' ? (
        <PasswordResetConfirmationLayout setStepFunc={setStepFunc} email={email} />
      ) : step === 'success' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '10%' }}>
          <Typography variant='h6'>
            Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant{' '}
            <Button id='redirect-button-to-login' sx={{ fontWeight: 'bold' }} variant='text' onClick={() => redirect('/login')}>
              vous connecter
            </Button>{' '}
            avec votre nouveau mot de passe.
          </Typography>
        </div>
      ) : null}
      {isOpen ? <DialogResetCodeSent isOpen={isOpen} handleDialog={handleDialog} /> : null}
    </>
  );
};

export default PasswordResetPage;
