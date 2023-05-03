import { useEffect, useState } from 'react';
import { Box, Button, Divider, Link, Modal, Typography } from '@mui/material';
import { UNVERIFIED_USER_BOX } from './style';
import { getCached } from 'src/providers/cache';

const UnverifiedUser = () => {
  const user = getCached.user();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const idVerified = user && user.idVerified;

  useEffect(() => {
    !idVerified && setIsOpen(true);
  }, [idVerified]);

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={UNVERIFIED_USER_BOX}>
        <Typography variant='h5'>Avertissement</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography mb={3} variant='body1'>
          Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au <Link href='mailto:contact@bpartners.app'>support</Link>.
        </Typography>
        <Button variant='contained' onClick={handleClose} id='closeWarning'>
          Fermer
        </Button>
      </Box>
    </Modal>
  );
};

export default UnverifiedUser;
