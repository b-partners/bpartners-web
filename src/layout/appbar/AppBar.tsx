import { ShortWarning } from '@/common/components/BPBetaTestWarning';
import { useCollapseSidebarOnTablet } from '@/common/hooks';
import { printError } from '@/common/utils';
import { authProvider, getCached, whoami } from '@/providers';
import { Menu } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { useSidebarState } from 'react-admin';
import { GeneralConditionOfUse } from '../../operations/configurations';
import UnverifiedUser from '../../operations/configurations/UnverifiedUser';
import { SecondaryUserBadge } from './SecondaryUserBadge';

const useStyle = makeStyles(() => ({
  LOGO: {
    width: '100px',
    marginLeft: 25,
  },
  TOOLBAR: {
    zIndex: '999',
    height: '3.2rem',
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    background: `#fff`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1) !important',
    border: 'none',
    outline: 'none',
  },
  sidebarToggleButton: {
    cursor: 'pointer',
  },
}));

export const AppBar = () => {
  const classes = useStyle();
  const userId = authProvider.getCachedWhoami()?.user?.id;
  const [name, setName] = useState('');
  const isBeta = process.env.REACT_APP_BETA !== 'false';
  const cachedUser = getCached.user();
  const isVerifiedUser = cachedUser?.idVerified;
  const isSubscribed = authProvider.isSubscribed();

  useEffect(() => {
    const fetch = async () => {
      if (userId) {
        const { firstName } = getCached.user() || (await whoami()).user;
        setName(firstName);
      }
    };
    fetch().catch(printError);
  }, [userId]);

  const [open, setOpen] = useSidebarState();
  useCollapseSidebarOnTablet();

  return (
    <>
      <Box className={classes.TOOLBAR} sx={{ boxShadow: 1 }}>
        <img src={'/logo.png'} alt='bp logo' className={classes.LOGO} />

        <Box sx={{ paddingInline: '1rem' }}>
          Bonjour <b>{name}</b> !<SecondaryUserBadge />
          {isVerifiedUser === null && <span style={{ color: 'rgb(168,141,104)' }}> (Chargement du statut du compte...)</span>}
          {isVerifiedUser === false && <span style={{ color: 'rgb(168,141,104)' }}> (Compte non vérifié)</span>}
        </Box>

        <Box sx={{ display: 'inherit', alignItems: 'center', paddingInline: '.6rem' }}>
          {isBeta && <ShortWarning />}
          <Tooltip title='' onClick={() => setOpen(!open)}>
            <Menu className={classes.sidebarToggleButton} />
          </Tooltip>
        </Box>
      </Box>
      {isSubscribed && <GeneralConditionOfUse />}
      <UnverifiedUser />
    </>
  );
};
