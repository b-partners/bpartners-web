import { useCallback, useState } from 'react';
import { AccountCircle, AccountBalance, Category, Euro, Lock, People, Receipt, Settings, Store, ContactSupport } from '@mui/icons-material';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { blue } from '@mui/material/colors';
import { Menu } from 'react-admin';
import authProvider from '../providers/auth-provider';

const SUPPORT_EMAIL = process.env.REACT_APP_BP_EMAIL_SUPPORT || '';

const LogoutButton = () => {
  const logout = useCallback(() => {
    authProvider.logout().then(() => {
      window.location.reload();
    });
  }, []);
  return <Menu.Item to='#' onClick={logout} name='logout' primaryText='Se déconnecter' leftIcon={<Lock />} />;
};

const BpMenu = () => {
  const [dialogState, setDialogState] = useState(false);
  const redirectToSwan = useCallback(() => {
    const swanUrl = 'https://banking.swan.io/login';
    window.open(swanUrl, '_blank', 'noopener');
  }, []);

  const toggleDialogState = () => setDialogState(e => !e);
  const contactSupport = e => {
    e.preventDefault();
    toggleDialogState();
  };

  const openMailService = e => {
    e.preventDefault();
    window.open('mailto:', SUPPORT_EMAIL);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%' }}>
      <Menu>
        <Menu.Item to='/transactions' name='transactions' primaryText='Mes transactions' leftIcon={<Euro />} />
        <Menu.Item to='/invoices' name='invoice' primaryText='Devis / facturation' leftIcon={<Receipt />} />
        <Menu.Item to='/customers' name='customers' primaryText='Mes clients' leftIcon={<People />} />
        <Menu.Item to='/account' name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} />
        <Menu.Item to='/products' name='products' primaryText='Mes produits' leftIcon={<Category />} />
        <Menu.Item to='/marketplaces' name='marketplaces' primaryText='Les marchés' leftIcon={<Store />} />
      </Menu>

      <Box sx={{ display: 'flex', alignItems: 'end' }}>
        <Dialog open={dialogState} onClose={toggleDialogState}>
          <DialogTitle>Support</DialogTitle>
          <DialogContent>
            Contactez-nous à l'adresse email <b>{SUPPORT_EMAIL}</b>.<br />
            <br />
            Pour utiliser votre client email, cliquez{' '}
            <a style={{ color: blue[800], cursor: 'pointer' }} onClick={openMailService}>
              ici
            </a>
            .
          </DialogContent>
          <DialogActions>
            <Button id='support_close_button_id' onClick={toggleDialogState}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
        <Menu>
          <Menu.Item to='/' onClick={redirectToSwan} primaryText='Aller sur Swan' name='swan' leftIcon={<AccountBalance />} />
          <Menu.Item to='/' onClick={contactSupport} primaryText='Contacter le support' name='support' leftIcon={<ContactSupport />} />
          <Menu.Item to='/configurations' name='configurations' primaryText='Configuration' leftIcon={<Settings />} />
          <LogoutButton />
        </Menu>
      </Box>
    </Box>
  );
};

export default BpMenu;
