import { useCallback } from 'react';
import { AccountCircle, AccountBalance, Category, Euro, Lock, People, Receipt, Settings, Store, ContactSupport } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Menu } from 'react-admin';
import authProvider from '../providers/auth-provider';

const LogoutButton = () => {
  const logout = useCallback(() => {
    authProvider.logout().then(e => {
      window.location.reload();
    });
  }, []);
  return <Menu.Item to='#' onClick={logout} name='logout' primaryText='Se déconnecter' leftIcon={<Lock />} />;
};

const BpMenu = () => {
  const redirectToSwan = useCallback(() => {
    const swanUrl = 'https://banking.swan.io/login';
    window.open(swanUrl, '_blank', 'noopener');
  }, []);

  const contactSupport = useCallback(() => {
    const email = 'contact@bpartners.app';
    window.open('mailto:', email); //TODO: additionaly display email in modal, as email clients are often NOT configured on customer devices
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%' }}>
      <Menu>
        <Menu.Item to='/transactions' name='transactions' primaryText='Mes transactions' leftIcon={<Euro />} />
        <Menu.Item to='/invoice' name='invoice' primaryText='Devis / facturation' leftIcon={<Receipt />} />
        <Menu.Item to='/customers' name='customers' primaryText='Mes clients' leftIcon={<People />} />
        <Menu.Item to='/account' name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} />
        <Menu.Item to='/products' name='products' primaryText='Mes produits' leftIcon={<Category />} />
        <Menu.Item to='/marketplaces' name='marketplaces' primaryText='Les marchés' leftIcon={<Store />} />
      </Menu>

      <Box sx={{ display: 'flex', alignItems: 'end' }}>
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
