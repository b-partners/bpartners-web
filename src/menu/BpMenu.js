import { AccountCircle, AccountBalance, Category, Euro, Lock, People, Receipt, Settings, Store, ContactSupport } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Menu } from 'react-admin';
import authProvider from '../providers/auth-provider';
import { makeStyles } from '@mui/styles';

const useStyle = makeStyles(() => ({
  menuItem: {
    height: '40px',
    justifyContent: 'flex-start',
    paddingLeft: '25px',
  },
}));

const LogoutButton = () => {
  const logout = async () => {
    await authProvider.logout();
    window.location.reload();
  };

  const classes = useStyle();

  return <Menu.Item to='#' onClick={logout} name='logout' primaryText='Se déconnecter' leftIcon={<Lock />} className={classes.menuItem} />;
};

const BpMenu = () => {
  const redirectToSwan = () => {
    const swanUrl = 'https://banking.swan.io/login';
    window.open(swanUrl, '_blank', 'noopener');
  };

  const contactSupport = () => {
    const email = 'contact@bpartners.app';
    window.open('mailto:', email);
  };

  const classes = useStyle();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%' }}>
      <Menu>
        <Menu.Item to='/transactions' name='transactions' primaryText='Mes transactions' leftIcon={<Euro />} className={classes.menuItem} />
        <Menu.Item to='/invoice' name='invoice' primaryText='Devis / facturation' leftIcon={<Receipt />} className={classes.menuItem} />
        <Menu.Item to='/customers' name='customers' primaryText='Mes clients' leftIcon={<People />} className={classes.menuItem} />
        <Menu.Item to='/account' name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} className={classes.menuItem} />
        <Menu.Item to='/products' name='products' primaryText='Mes produits' leftIcon={<Category />} className={classes.menuItem} />
        <Menu.Item to='/marketplaces' name='marketplaces' primaryText='Les marchés' leftIcon={<Store />} className={classes.menuItem} />
      </Menu>

      <Box sx={{ display: 'flex', alignItems: 'end' }}>
        <Menu>
          <Menu.Item to='/' onClick={redirectToSwan} primaryText='Aller sur Swan' name='swan' leftIcon={<AccountBalance />} className={classes.menuItem} />
          <Menu.Item
            to='/'
            onClick={contactSupport}
            primaryText='Contacter le support'
            name='support'
            leftIcon={<ContactSupport />}
            className={classes.menuItem}
          />
          <Menu.Item to='/configurations' name='configurations' primaryText='Configuration' leftIcon={<Settings />} className={classes.menuItem} />
          <LogoutButton />
        </Menu>
      </Box>
    </Box>
  );
};

export default BpMenu;
