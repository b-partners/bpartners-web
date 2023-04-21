import { useCallback, useState, useEffect } from 'react';
import { AccountCircle, AccountBalance, Category, Euro, Lock, People, Receipt, Settings, Store, ContactSupport, ReceiptLong } from '@mui/icons-material';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { blue } from '@mui/material/colors';
import { Menu } from 'react-admin';
import authProvider from '../providers/auth-provider';
import accountProvider from 'src/providers/account-provider';

const SUPPORT_EMAIL = process.env.REACT_APP_BP_EMAIL_SUPPORT || '';

const LogoutButton = () => {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    authProvider.logout().then(() => {
      navigate('/login');
    });
  }, []);
  return <Menu.Item to='#' onClick={logout} name='logout' primaryText='Se déconnecter' leftIcon={<Lock />} />;
};

const BpMenu = () => {
  const [dialogState, setDialogState] = useState(false);

  const toggleDialogState = () => setDialogState(e => !e);
  const contactSupport = e => {
    e.preventDefault();
    toggleDialogState();
  };

  const openMailService = e => {
    e.preventDefault();
    window.open('mailto:', SUPPORT_EMAIL);
  };

  const [accountHolder, setAccountHolder] = useState(null);
  useEffect(() => {
    async function asyncSetAccountHolder() {
      const account = await accountProvider.getOne(authProvider.getCachedWhoami().user.id);
      setAccountHolder(account.accountHolder);
    }
    asyncSetAccountHolder();
  }, []);

  const hasBusinessActivities = accountHolder =>
    accountHolder != null &&
    accountHolder.businessActivities != null &&
    (accountHolder.businessActivities.primary != null || accountHolder.businessActivities.secondary != null);
  const hasCarreleur = businessActivities =>
    businessActivities != null && (businessActivities.primary == 'Carreleur' || businessActivities.secondary == 'Carreleur');
  // The hasBusinessActivities guard in the following implies that when accountHolder is not loaded yet,
  // then neither Markplaces nor Prospects is diplayed
  const shouldShowProspects = hasBusinessActivities(accountHolder) && hasCarreleur(accountHolder.businessActivities);
  const shouldShowMarketplaces = hasBusinessActivities(accountHolder) && !hasCarreleur(accountHolder.businessActivities);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        height: '96%',
        position: 'fixed',
        top: 60,
      }}
    >
      <Menu>
        <Menu.Item to='/transactions' name='transactions' primaryText='Mes transactions' leftIcon={<Euro />} />
        <Menu.Item to='/invoices' name='invoice' primaryText='Devis / facturation' leftIcon={<Receipt />} />
        <Menu.Item to='/customers' name='customers' primaryText='Mes clients' leftIcon={<People />} />
        <Menu.Item to='/products' name='products' primaryText='Mes produits' leftIcon={<Category />} />
        {shouldShowMarketplaces && <Menu.Item to='/marketplaces' name='marketplaces' primaryText='Mes marchés' leftIcon={<Store />} />}
        {shouldShowProspects && <Menu.Item to='/prospects' name='prospects' primaryText='Mes prospects' leftIcon={<ReceiptLong />} />}
        <Menu.Item to='/account' name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} />
      </Menu>

      <Box sx={{ display: 'flex', alignItems: 'end' }}>
        <Dialog open={dialogState} onClose={toggleDialogState}>
          <DialogTitle>Support</DialogTitle>
          <DialogContent>
            Contactez-nous à l'adresse email <b>{SUPPORT_EMAIL}</b>.<br />
            <br />
            Pour utiliser votre client email, cliquez{' '}
            <span style={{ color: blue[800], cursor: 'pointer' }} onClick={openMailService}>
              ici
            </span>
            .
          </DialogContent>
          <DialogActions>
            <Button id='support_close_button_id' onClick={toggleDialogState}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
        <Menu>
          <Menu.Item to='/bank' primaryText='Ma banque' name='bank' leftIcon={<AccountBalance />} />
          <Menu.Item to='/' onClick={contactSupport} primaryText='Contacter le support' name='support' leftIcon={<ContactSupport />} />
          <Menu.Item to='/configurations' name='configurations' primaryText='Configuration' leftIcon={<Settings />} />
          <LogoutButton />
        </Menu>
      </Box>
    </Box>
  );
};

export default BpMenu;
