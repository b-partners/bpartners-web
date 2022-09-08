import { Box, Typography, Avatar } from '@mui/material';

import { Show, useRecordContext, SimpleShowLayout, TextField } from 'react-admin';
import authProvider from '../../providers/auth-provider';

export const AccountHolderLayout = () => {
  const record = useRecordContext();
  const imgSrc = record != null ? record.accountHolder.logo : null;
  return (
    <SimpleShowLayout>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar src={imgSrc} /*TODO: handle null case*/ title='Logo' variant='square' />
        <TextField ml={2} source='accountHolder.name' label='Raison sociale' />
      </Box>
      <TextField source='accountHolder.siren' label='SIREN' />
      <TextField source='accountHolder.address' label='Adresse' />
    </SimpleShowLayout>
  );
};

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
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar variant='square' alt='subscription logo' src='https://www.bpartners.app/static/media/ambitieux.4acee4dedf2cd21425bf.png' />
      <Typography ml={2} variant='h6'>
        L'ambitieux
      </Typography>
    </Box>
    <Typography variant='body'>
      <b style={{ color: 'green' }}>0€ de coût fixe par mois, au lieu de 20€, grâce à votre pré-inscription !</b> <br />
      200€ de retraits gratuits par mois, puis 1% du montant <br />
      1500€ de plafond de retrait <br />
      2% pour les paiements hors zone euro <br />
      30 virements et prélèvements puis 0,50€ au delà
    </Typography>
  </SimpleShowLayout>
);

const AccountShow = () => {
  const userId = authProvider.getCachedWhoami().id;

  return (
    <Show id={userId} resource='account' basePath='/account'>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', margin: 2 }}>
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
            Mon abonnement
          </Typography>
          <SubscriptionLayout />
        </Box>
      </Box>
    </Show>
  );
};

export default AccountShow;
