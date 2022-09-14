import LockIcon from '@material-ui/icons/Lock';
import authProvider from './providers/auth-provider';
import accountProvider from './providers/account-provider';
import { IconButton, Tooltip, Box } from '@material-ui/core';
import { useCallback, useEffect, useState } from 'react';

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
  const userId = authProvider.getCachedWhoami().user.id;
  const [name, setName] = useState('');

  // memoize the function to avoid creating it all the time
  const getFirstName = useCallback(() => {
    accountProvider.getOne(userId).then(data => setName(data.user.firstName));
  }, [userId]);

  useEffect(() => getFirstName(), [getFirstName]);

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
