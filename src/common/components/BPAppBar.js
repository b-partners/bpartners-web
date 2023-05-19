import { makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { SidebarToggleButton, useNotify } from 'react-admin';
import bpLogo from '../../assets/bp-logo-full.webp';
import { ShortWarning } from './BPBetaTestWarning';
import { GeneralConditionOfUse } from '../../operations/configurations';
import UnverifiedUser from '../../operations/configurations/UnverifiedUser';
import BPDialog from './BPDialog';
import { redirect } from '../utils/redirect';
import { accountProvider, authProvider, getCached, initiateAccountValidation, whoami } from 'src/providers';
import { printError } from '../utils';

const useStyle = makeStyles(() => ({
  LOGO: {
    height: '2.7rem',
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
    height: '2.5rem',
    width: '2.5rem',
  },
}));

const BPAppBar = () => {
  const classes = useStyle();
  const userId = authProvider.getCachedWhoami()?.user?.id;
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const isBeta = process.env.REACT_APP_BETA !== 'false';
  const cachedUser = getCached.user();
  const isVerifiedUser = cachedUser && cachedUser.idVerified;
  const notify = useNotify();

  useEffect(() => {
    const fetch = async () => {
      if (userId) {
        const { firstName } = getCached.user() || (await whoami()).user;
        const { status } = getCached.account() || (await accountProvider.getOne());

        setName(firstName);
        setStatus(status);
      }
    };
    fetch().catch(printError);
  }, [userId]);

  useEffect(() => {
    const isAccountValidated = () => {
      setOpenDialog(status === 'VALIDATION_REQUIRED' || status === 'INVALID_CREDENTIALS');
    };
    isAccountValidated();
  }, [status]);

  const accountValidation = async () => {
    try {
      const redirectionUrl = (await initiateAccountValidation()).redirectionUrl;
      redirect(redirectionUrl);
    } catch (err) {
      notify('Une erreur est survenue au moment de la redirection.', { type: 'warning' });
    }
  };

  return (
    <>
      <Box className={classes.TOOLBAR} sx={{ boxShadow: 1 }}>
        <img src={bpLogo} alt='bp logo' className={classes.LOGO} />

        <Box sx={{ paddingInline: '1rem' }}>
          Bonjour <b>{name}</b> !{isVerifiedUser === null && <span style={{ color: 'rgb(168,141,104)' }}> (Chargement du statut du compte...)</span>}
          {isVerifiedUser === false && <span style={{ color: 'rgb(168,141,104)' }}> (Compte non vérifié)</span>}
        </Box>

        <Box sx={{ display: 'inherit', alignItems: 'center', paddingInline: '.6rem' }}>
          {isBeta && <ShortWarning />}
          <SidebarToggleButton className={classes.sidebarToggleButton} />
        </Box>
      </Box>

      <BPDialog
        title='Validation de vos identifiants requis'
        content={['Il semble que vos identifiants ne soient pas corrects, veuillez les valider.']}
        btnLabel='Valider les identifiants'
        open={openDialog}
        handleClick={accountValidation}
      />
      <GeneralConditionOfUse />
      {getCached.user() && <UnverifiedUser />}
    </>
  );
};
export default BPAppBar;
