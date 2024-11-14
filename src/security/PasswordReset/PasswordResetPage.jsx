import { useState } from 'react';
import { DialogResetCodeSent } from './components/DialogResetCodeSent';
import PasswordResetRequestLayout from './components/PasswordResetRequestLayout';

const PasswordResetPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDialog = value => {
    setIsOpen(value);
  };

  return (
    <>
      <PasswordResetRequestLayout handleDialog={handleDialog} />
      <DialogResetCodeSent isOpen={isOpen} handleDialog={handleDialog} />
    </>
  );
};

export default PasswordResetPage;
