import { makeStyles, useMediaQuery } from '@material-ui/core';
import { Box } from '@mui/system';
import { useCallback, useEffect, useState } from 'react';
import { ShortWarning } from './utils/beta-test-warning';
import bpLogo from './assets/bp-logo-full.png';
import accountProvider from './providers/account-provider';
import authProvider from './providers/auth-provider';
import { SidebarToggleButton, useSidebarState } from 'react-admin';

const useStyle = makeStyles(() => ({
  LOGO: {
    height: '2.7rem',
  },
  TOOLBAR: {
    zIndex: '999',
    height: '3.5rem',
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: 2,

    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarToggleButton: {
    height: '2.5rem',
    width: '2.5rem',
  },
}));

const BpAppBar = props => {
  const classes = useStyle();
  const userId = authProvider.getCachedWhoami()?.user?.id;
  const [name, setName] = useState('');

  const getFirstName = useCallback(() => {
    userId && accountProvider.getOne(userId).then(data => setName(data.user.firstName));
  }, [userId]);

  useEffect(() => getFirstName(), [getFirstName]);

  return (
    <Box {...props} className={classes.TOOLBAR} sx={{ boxShadow: 1 }}>
      <img src={bpLogo} alt='bp logo' className={classes.LOGO} />

      <Box sx={{ paddingInline: '1rem' }}>
        Bonjour <b>{name}</b> !
      </Box>

      <Box sx={{ display: 'inherit', alignItems: 'center', paddingInline: '.6rem' }}>
        <ShortWarning />
        <SidebarToggleButton className={classes.sidebarToggleButton} />
      </Box>
    </Box>
  );
};
export default BpAppBar;
