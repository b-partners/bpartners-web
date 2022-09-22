import { Box, Typography, Avatar } from '@mui/material';
import authProvider from '../../providers/auth-provider';

import { Show, SimpleShowLayout, TextField } from 'react-admin';
import { filesProvider } from 'src/providers/file-provider';
import { useEffect, useState } from 'react';

export const AccountHolderLayout = () => {
  const logoFiledId = authProvider.getCachedWhoami()?.user.logoFileId;
  const [file, setFile] = useState("");
 
  useEffect(() => {
    logoFiledId && filesProvider.getOne(logoFiledId).then(data => setFile(data.sha256));
  },[logoFiledId])

  return (
    <SimpleShowLayout>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor="upload-photo">
          <input
            style={{ display: 'none' }}
            id="upload-photo"
            name="upload-photo"
            type="file"
            onChange={() => {
              filesProvider.saveOrUpdate();
            }}
          />
          {file && <Avatar alt="logo" src={file} /> }
        </label>
        <TextField ml={2} source='accountHolder.name' label='Raison sociale' />
      </Box>
      {/* TODO: backend should implement it  */}
      {/* <TextField source='accountHolder.siren' label='SIREN' /> */}
      <TextField ml={2} source='accountHolder.postalCode' label='Code postal' />
      <TextField ml={2} source='accountHolder.city' label='Citée' />
      <TextField ml={2} source='accountHolder.country' label='Pays' />
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
  const userId = authProvider.getCachedWhoami().user.id;

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