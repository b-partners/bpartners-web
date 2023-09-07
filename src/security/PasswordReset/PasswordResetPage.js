// import { Auth } from 'aws-amplify';
import PasswordResetRequestLayout from './components/PasswordResetRequestLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import PasswordResetConfirmationLayout from './components/PasswordResetConfirmationLayout';
import { DialogResetCodeSent } from './components/DialogResetCodeSent';

const PasswordResetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const setStepFunc = (step, email) => {
    setStep(step);
    setEmail(email);
  };
  const handleDialog = value => {
    setIsOpen(value);
  };

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
            <Button sx={{ fontWeight: 'bold' }} variant='text' onClick={() => navigate('/login')}>
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
