import { useCallback, useEffect, useState } from 'react';
import {
  AccountBalance,
  AccountCircle,
  Category,
  ContactSupport,
  Euro,
  Handshake,
  Lock,
  People,
  Receipt,
  ReceiptLong,
  Settings,
  Store,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'react-admin';
import { printError } from 'src/common/utils';
import { accountHolderProvider, authProvider } from '../providers';
import { SupportDialog } from 'src/common/components';

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

  const toggleDialogState = () => setDialogState(e => !e);
  const contactSupport = e => {
    e.preventDefault();
    toggleDialogState();
  };

  const [accountHolder, setAccountHolder] = useState(null);
  useEffect(() => {
    async function asyncSetAccountHolder() {
      const fetchedAccountHolder = await accountHolderProvider.getOne();
      setAccountHolder(fetchedAccountHolder);
    }

    asyncSetAccountHolder().catch(printError);
  }, []);

  const hasBusinessActivities = accountHolder =>
    accountHolder != null &&
    accountHolder.businessActivities != null &&
    (accountHolder.businessActivities.primary != null || accountHolder.businessActivities.secondary != null);
  const hasCarreleur = businessActivities =>
    businessActivities != null &&
    (businessActivities.primary === 'Carreleur' ||
      businessActivities.primary === 'Antinuisibles 3D' ||
      businessActivities.secondary === 'Carreleur' ||
      businessActivities.secondary === 'Antinuisibles 3D');
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
        {shouldShowMarketplaces && <Menu.Item to='/marketplaces' name='marketplaces' primaryText='Mes marchés' leftIcon={<Store />} />}
        {shouldShowProspects && <Menu.Item to='/prospects' name='prospects' primaryText='Mes prospects' leftIcon={<ReceiptLong />} />}
        <Menu.Item to='/account' name='account' primaryText='Mon compte' leftIcon={<AccountCircle />} />
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
