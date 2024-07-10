import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Redirect } from 'src/common/utils';
import { DialogResetCodeSent } from './components/DialogResetCodeSent';
import PasswordResetConfirmationLayout from './components/PasswordResetConfirmationLayout';
import PasswordResetRequestLayout from './components/PasswordResetRequestLayout';

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
        Redirect.toURL('/login');
      }
      return () => {
        clearTimeout(timeoutId);
      };
    }, 5000);
  }, [step]);

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
            <Button id='redirect-button-to-login' sx={{ fontWeight: 'bold' }} variant='text' onClick={() => Redirect.toURL('/login')}>
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
