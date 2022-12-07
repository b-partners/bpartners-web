import { makeStyles, useMediaQuery } from '@material-ui/core';
import { Box } from '@mui/system';
import { useCallback, useEffect, useState } from 'react';
import { SidebarToggleButton } from 'react-admin';
import bpLogo from './assets/bp-logo-full.png';
import accountProvider, { getCachedUser } from './providers/account-provider';
import authProvider from './providers/auth-provider';
import { LongWarning, ShortWarning } from './utils/beta-test-warning';
import { GeneralConditionOfUse } from './operations/configurations';
import UnverifiedUser from './operations/configurations/UnverifiedUser';

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
  const displayAppBarWarning = useMediaQuery('(min-width: 468px)');
  const [name, setName] = useState('');
  const isBeta = process.env.REACT_APP_BETA;
  const isVerifiedUser = getCachedUser() && getCachedUser().idVerified;

  const getFirstName = useCallback(() => {
    userId && accountProvider.getOne(userId).then(data => setName(data.user.firstName));
  }, [userId]);

  useEffect(() => getFirstName(), [getFirstName]);

  return (
    <>
      <Box {...props} className={classes.TOOLBAR} sx={{ boxShadow: 1 }}>
        <img src={bpLogo} alt='bp logo' className={classes.LOGO} />

        <Box sx={{ paddingInline: '1rem' }}>
          Bonjour <b>{name}</b> ! {!isVerifiedUser && <span style={{ color: 'rgb(168,141,104)' }}>(Compte non vérifié)</span>}
        </Box>

        <Box sx={{ display: 'inherit', alignItems: 'center', paddingInline: '.6rem' }}>
          {displayAppBarWarning && isBeta && <ShortWarning />}
          <SidebarToggleButton className={classes.sidebarToggleButton} />
        </Box>
      </Box>

      {isBeta && <LongWarning />}
      <GeneralConditionOfUse />
      {getCachedUser() && <UnverifiedUser />}
    </>
  );
};
export default BpAppBar;
