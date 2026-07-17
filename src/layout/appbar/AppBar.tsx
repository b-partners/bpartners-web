import { ShortWarning } from '@/common/components/BPBetaTestWarning';
import BPDialog from '@/common/components/BPDialog';
import { printError, Redirect } from '@/common/utils';
import { GeneralConditionOfUse } from '@/operations/configurations';
import { authProvider, getCached, initiateAccountValidation, whoami } from '@/providers';
import { Menu } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { useNotify, useSidebarState } from 'react-admin';

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
  const [openDialog, setOpenDialog] = useState(false);
  const isBeta = process.env.REACT_APP_BETA !== 'false';
  const isSubscribed = authProvider.isSubscribed();
  const notify = useNotify();

  useEffect(() => {
    const fetch = async () => {
      if (userId) {
        const { firstName } = getCached.user() || (await whoami()).user;
        setName(firstName);
      }
    };
    fetch().catch(printError);
  }, [userId]);

  const accountValidation = async () => {
    try {
      const redirectionUrl = (await initiateAccountValidation()).redirectionUrl;
      Redirect.toURL(redirectionUrl);
    } catch {
      notify('Une erreur est survenue au moment de la redirection.', { type: 'warning' });
    }
  };

  const onClose = () => {
    setOpenDialog(false);
  };

  const [open, setOpen] = useSidebarState();

  return (
    <>
      <Box className={classes.TOOLBAR} sx={{ boxShadow: 1 }}>
        <img src={'/logo.png'} alt='bp logo' className={classes.LOGO} />

        <Box sx={{ paddingInline: '1rem' }}>
          Bonjour <b>{name}</b> !
        </Box>

        <Box sx={{ display: 'inherit', alignItems: 'center', paddingInline: '.6rem' }}>
          {isBeta && <ShortWarning />}
          <Tooltip title='' onClick={() => setOpen(!open)}>
            <Menu className={classes.sidebarToggleButton} />
          </Tooltip>
        </Box>
      </Box>
      <BPDialog
        title='Mettez à jour votre banque'
        content={[
          'Pour continuer à voir vos transactions et encaisser en temps réel, veuillez reconnecter votre banque.',
          'En cas de question, contactez le : 06 68 62 48 36',
        ]}
        btnLabel='Synchroniser ma banque'
        open={openDialog}
        handleClick={accountValidation}
        onClose={onClose}
      />
      {isSubscribed && <GeneralConditionOfUse />}
    </>
  );
};
