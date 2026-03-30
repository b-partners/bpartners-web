import { SupportDialog } from '@/common/components';
import { printError } from '@/common/utils';
import { AccountCircle, Category, ContactSupport, Handshake, Home as HomeIcon, Lock, People, Receipt, ReceiptLong } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useState } from 'react';
import { Menu as RaMenu } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { authProvider, getCached } from '../../providers';

const LogoutButton = () => {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    authProvider
      .logout()
      .then(() => {
        navigate('/login');
      })
      .catch(printError);
  }, []);
  return <RaMenu.Item to='#' onClick={logout} name='logout' primaryText='Se déconnecter' leftIcon={<Lock />} />;
};

export const Menu = () => {
  const [dialogState, setDialogState] = useState(false);
  const toggleDialogState = () => setDialogState(e => !e);
  const contactSupport = e => {
    e.preventDefault();
    toggleDialogState();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        height: '95%',
        position: 'fixed',
        top: 60,
      }}
    >
      <RaMenu>
        <RaMenu.Item to='/' name='home' primaryText='Accueil' leftIcon={<HomeIcon />} />
        <RaMenu.Item to='/invoices' name='invoice' primaryText='Devis / facturation' leftIcon={<Receipt />} />
        <RaMenu.Item to='/customers' name='customers' primaryText='Mes clients' leftIcon={<People />} />
        <RaMenu.Item to='/products' name='products' primaryText='Mes produits' leftIcon={<Category />} />
        <RaMenu.Item to='/prospects' name='prospects' primaryText='Mes prospects' leftIcon={<ReceiptLong />} />
        <RaMenu.Item to={`/account/${getCached.account()?.id || ''}`} name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} />
      </RaMenu>
      <Box sx={{ display: 'flex', alignItems: 'end' }}>
        <SupportDialog onToggle={toggleDialogState} open={dialogState} />
        <RaMenu>
          <RaMenu.Item to='/partners' primaryText='Partenaires' name='partners' leftIcon={<Handshake />} />
          <RaMenu.Item to='/helps' onClick={contactSupport} primaryText='Besoin d’aide ?' name='support' leftIcon={<ContactSupport />} />
          <LogoutButton />
        </RaMenu>
      </Box>
    </Box>
  );
};
