import { Box } from '@mui/material';

import { IconButton, Tooltip } from '@material-ui/core';
import { TextField } from '@react-admin/ra-enterprise';
import LockIcon from '@material-ui/icons/Lock';
import authProvider from './providers/auth-provider';
import accountProvider from './providers/account-provider';
import profileProvider from './providers/profile-provider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthState } from 'react-admin';

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

const BpAppBar = props => {
  const userId = authProvider.getCachedWhoami().id;
  const [name, setName] = useState('');

  // memoize the function to avoid creating this function all the time
  const getFirstName = useCallback(() => {
    accountProvider.getOne(userId).then(data => setName(data.user.firstName));
  }, []);

  useEffect(() => getFirstName(), []);

  return (
    <Box {...props} display='flex' justifyContent='flex-end' mt={-5}>
      <Box>
        Bonjour <b>{name}</b> !
        <LogoutButton />
      </Box>
    </Box>
  );
};
export default BpAppBar;
