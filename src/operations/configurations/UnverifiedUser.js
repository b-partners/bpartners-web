import { useEffect, useState } from 'react';
import { Box, Button, Divider, Link, Modal, Typography } from '@mui/material';
import { getCachedUser } from 'src/providers/account-provider';

const UnverifiedUser = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const idVerified = getCachedUser().idVerified;

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 1,
    p: 4,
  };

  useEffect(() => {
    !idVerified && setOpen(true);
  }, []);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
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
