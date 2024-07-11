import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { SidebarToggleButton, useNotify } from 'react-admin';
import { accountProvider, authProvider, getCached, initiateAccountValidation, whoami } from 'src/providers';
import bpLogo from '../../assets/bp-logo-full.webp';
import { GeneralConditionOfUse } from '../../operations/configurations';
import UnverifiedUser from '../../operations/configurations/UnverifiedUser';
import { printError } from '../utils';
import { Redirect } from '../utils';
import { ShortWarning } from './BPBetaTestWarning';
import BPDialog from './BPDialog';

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
      setOpenDialog(status === 'VALIDATION_REQUIRED' || status === 'INVALID_CREDENTIALS' || status === 'SCA_REQUIRED');
    };
    isAccountValidated();
  }, [status]);

  const accountValidation = async () => {
    try {
      const redirectionUrl = (await initiateAccountValidation()).redirectionUrl;
      Redirect.toURL(redirectionUrl);
    } catch (err) {
      notify('Une erreur est survenue au moment de la redirection.', { type: 'warning' });
    }
  };

  const onClose = () => {
    setOpenDialog(false);
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
        title='Mettez à jour votre banque'
        content={[
          'Pour continuer à voir vos transactions et encaisser en temps réel, veuillez reconnecter votre banque.',
          'En cas de question, contactez le : 01 84 80 31 69',
        ]}
        btnLabel='Synchroniser ma banque'
        open={openDialog}
        handleClick={accountValidation}
        onClose={onClose}
      />
      <GeneralConditionOfUse />
      {getCached.user() && <UnverifiedUser />}
    </>
  );
};
export default BPAppBar;
