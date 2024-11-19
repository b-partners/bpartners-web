import { BP_COLOR } from '@/bp-theme';
import { EmailOutlined } from '@mui/icons-material';
import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { FC } from 'react';

const D_CONTENT = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  textAlign: 'center',
  padding: '4rem',
  color: grey['500'],
};

const D_ICON_CONTAINER = {
  width: '7rem',
  height: '7rem',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: BP_COLOR['solid_grey'],
  padding: '1rem',
};

const D_ICON = { fontSize: '7rem', color: grey['400'] };

export const SupportDialog: FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <>
      <DialogTitle>Support</DialogTitle>
      <DialogContent sx={D_CONTENT}>
        <Box sx={D_ICON_CONTAINER}>
          <IconButton size='large' disabled>
            <EmailOutlined sx={D_ICON} />
          </IconButton>
        </Box>
        <Typography variant='body2' mb='1rem'>
          contact@bpartners.app
        </Typography>
        <Typography>
          Pour contacter le support, veuillez envoyer un courriel à contact@bpartners.app ou nous appeler directement au: <br />
          01 84 80 31 69
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button id='support_close_button_id' onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </>
  );
};
