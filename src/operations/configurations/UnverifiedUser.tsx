import { useToggle } from '@/common/hooks';
import { asyncGetUser } from '@/providers';
import { Box, Button, Divider, Link, Modal, Typography } from '@mui/material';
import { useEffect } from 'react';
import { UNVERIFIED_USER_BOX } from './style';

const UnverifiedUser = () => {
  const { value: isOpen, handleClose, handleOpen } = useToggle();

  useEffect(() => {
    asyncGetUser().then(user => {
      const idVerified = user?.idVerified;
      !idVerified && handleOpen();
    });
  }, []);

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={UNVERIFIED_USER_BOX}>
        <Typography variant='h5'>Avertissement</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography mb={3} variant='body1'>
          Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au <Link href='mailto:contact@birdia.fr'>support</Link>.
        </Typography>
        <Button variant='contained' onClick={handleClose} id='closeWarning'>
          Fermer
        </Button>
      </Box>
    </Modal>
  );
};

export default UnverifiedUser;
