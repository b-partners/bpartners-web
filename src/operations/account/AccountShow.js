import { Box, Typography } from '@mui/material';

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
          <ProfileLayout />
        </Box>
      </Box>
    </Show>
  );
};

export default AccountShow;
