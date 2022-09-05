import { Box, Typography, Avatar } from '@mui/material';

import { Show, SimpleShowLayout, TextField } from 'react-admin';
import authProvider from '../../providers/auth-provider';

export const AccountHolderLayout = () => (
  <SimpleShowLayout>
    {/*TODO: logo*/}
    <TextField source='accountHolder.name' label='Raison sociale' />
    <TextField source='accountHolder.siren' label='SIREN' />
    <TextField source='accountHolder.address' label='Adresse' />
  </SimpleShowLayout>
);

const ProfileLayout = () => (
  <SimpleShowLayout>
    <TextField source='user.firstName' id='firstName' label='Prénom' />
    <TextField source='user.lastName' id='lastName' label='Nom' />
    <TextField source='user.phone' id='phone' label='Téléphone' />
    <TextField source='user.address' id='address' label='Adresse' />
  </SimpleShowLayout>
);

const SubscriptionLayout = () => (
  <SimpleShowLayout>
  {/*TODO: logo*/}
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Avatar variant="square" alt="subscription logo" src="https://dev.bpartners.app/static/media/essentiel.cb090d9cf088f1bc56cf.png" />
      <Typography ml={2} variant="body2">L'essentiel</Typography>
    </Box>
    <Typography variant="h6">60k/an</Typography>
    <Typography variant="body2">200€ de retraits gratuits par mois, puis 1% du montant.</Typography>
    <Typography variant="body2">1500€ de plafond de retrait.</Typography>
    <Typography variant="body2">2% pour les paiements hors zone euro.</Typography>
    <Typography variant="body2">30 virements et prélèvements puis 0,50€ au delà.</Typography>
  </SimpleShowLayout>
);

const AccountShow = () => {
  const userId = authProvider.getCachedWhoami().id;

  return (
    <Show id={userId} resource='account' basePath='/account'>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', margin: 2, height: '100vh' }}>
        <Box sx={{ flexShrink: 0, flexGrow: 1 }}>
          <Typography variant='h5' gutterBottom mt={1}>
            Ma société
          </Typography>
          <AccountHolderLayout />
        </Box>
        <Box sx={{ flexShrink: 0, flexGrow: 1 }}>
          <Typography variant='h5' gutterBottom mt={1}>
            Mon identité
          </Typography>
          <ProfileLayout />
        </Box>
        <Box sx={{ flexShrink: 0, flexGrow: 1 }}>
          <Typography variant='h5' gutterBottom mt={1}>
            Mon abonnement {/* TODO */}
          </Typography>
          <SubscriptionLayout />
        </Box>
      </Box>
    </Show>
  );
};

export default AccountShow;
