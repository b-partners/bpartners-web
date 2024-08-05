import { SupportDialog } from '@/common/components';
import { printError } from '@/common/utils';
import {
  AccountBalance,
  AccountCircle,
  CalendarMonth,
  Category,
  ContactSupport,
  Euro,
  Handshake,
  Lock,
  People,
  Receipt,
  ReceiptLong,
  Settings,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Menu } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { accountHolderProvider, authProvider, getCached } from '../providers';

const LogoutButton = () => {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    authProvider
      .logout()
      .then(() => {
        navigate('/login');
      })
      .catch(printError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Menu.Item to='#' onClick={logout} name='logout' primaryText='Se déconnecter' leftIcon={<Lock />} />;
};

const BpMenu = () => {
  const [dialogState, setDialogState] = useState(false);
  const { data: accountHolder = null } = useQuery({
    retry: 7,
    queryKey: ['accountHolder'],
    onError: printError,
    queryFn: () => accountHolderProvider.getOne(),
  });

  const toggleDialogState = () => setDialogState(e => !e);
  const contactSupport = e => {
    e.preventDefault();
    toggleDialogState();
  };

  const hasBusinessActivities = accountHolder => !!(accountHolder?.businessActivities?.primary || accountHolder?.businessActivities?.secondary);
  /* The hasBusinessActivities guard in the following implies that when accountHolder is not loaded yet,
   then the Prospects page will not be displayed */
  const shouldShowProspects = hasBusinessActivities(accountHolder);

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
      <Menu>
        <Menu.Item to='/transactions' name='transactions' primaryText='Mes transactions' leftIcon={<Euro />} />
        <Menu.Item to='/invoices' name='invoice' primaryText='Devis / facturation' leftIcon={<Receipt />} />
        <Menu.Item to='/customers' name='customers' primaryText='Mes clients' leftIcon={<People />} />
        <Menu.Item to='/products' name='products' primaryText='Mes produits' leftIcon={<Category />} />
        {shouldShowProspects && <Menu.Item to='/prospects' name='prospects' primaryText='Mes prospects' leftIcon={<ReceiptLong />} />}
        <Menu.Item to={`/account/${getCached.account()?.id || ''}`} name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} />
        <Menu.Item to='/calendar' name='calendar' primaryText='Mon agenda' leftIcon={<CalendarMonth />} />
      </Menu>
      <Box sx={{ display: 'flex', alignItems: 'end' }}>
        <SupportDialog onToggle={toggleDialogState} open={dialogState} />
        <Menu>
          <Menu.Item to='/partners' primaryText='Partenaires' name='partners' leftIcon={<Handshake />} />
          <Menu.Item to='/bank' primaryText='Ma banque' name='bank' leftIcon={<AccountBalance />} />
          <Menu.Item to='/' onClick={contactSupport} primaryText='Besoin d’aide ?' name='support' leftIcon={<ContactSupport />} />
          <Menu.Item to='/configurations' name='configurations' primaryText='Configuration' leftIcon={<Settings />} />
          <LogoutButton />
        </Menu>
      </Box>
    </Box>
  );
};

export default BpMenu;
