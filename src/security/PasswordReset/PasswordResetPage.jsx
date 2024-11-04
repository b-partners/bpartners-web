import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DialogResetCodeSent } from './components/DialogResetCodeSent';
import PasswordResetRequestLayout from './components/PasswordResetRequestLayout';

const PasswordResetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleDialog = value => {
    setIsOpen(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (step === 'success') {
        navigate('/login');
      }
      return () => {
        clearTimeout(timeoutId);
      };
    }, 5000);
  }, []);

  return (
    <>
      <PasswordResetRequestLayout handleDialog={handleDialog} />
      <DialogResetCodeSent isOpen={isOpen} handleDialog={handleDialog} />
    </>
  );
};

export default PasswordResetPage;
