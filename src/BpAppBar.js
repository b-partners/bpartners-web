import { Box } from '@mui/material';

import { IconButton, Tooltip } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import authProvider from './providers/auth-provider';

const LogoutButton = () => {
  const logout = () => {
    authProvider.logout();
    window.location.reload();
  };
  return (
    <Tooltip title='Se déconnecter' onClick={logout}>
      <IconButton color='inherit'>
        <LockIcon />
      </IconButton>
    </Tooltip>
  );
};

const BpAppBar = props => (
  <Box {...props} display='flex' justifyContent='flex-end' mt={-5}>
    <Box>
      Bonjour <b>Fonenantsoa{/*TODO*/}</b> !
      <LogoutButton />
    </Box>
  </Box>
);
export default BpAppBar;
