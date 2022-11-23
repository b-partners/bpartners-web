import { AccountCircle, AccountBalance, Category, Euro, Lock, People, Receipt, Settings, Store } from '@material-ui/icons';
import { Box } from '@mui/material';
import { Menu } from 'react-admin';
import authProvider from '../providers/auth-provider';

const LogoutButton = () => {
  const logout = async () => {
    await authProvider.logout();
    window.location.reload();
  };
  return <Menu.Item to='#' onClick={logout} name='deconnection' primaryText='Se déconnecter' leftIcon={<Lock />} />;
};

const BpMenu = () => {
  const redirectToSwan = () => {
    const swanUrl = 'https://banking.swan.io/login';
    window.open(swanUrl, '_blank', 'noopener');
  };

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
          <Menu.Item to='/configurations' name='configurations' primaryText='Configuration' leftIcon={<Settings />} />
          <LogoutButton />
        </Menu>
      </Box>
    </Box>
  );
};

export default BpMenu;
