import { green } from '@material-ui/core/colors';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Avatar, Badge, Box, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { ShowBase, SimpleShowLayout, TextField, useNotify, useRefresh } from 'react-admin';
import { BP_COLOR } from 'src/bpTheme';
import { fileProvider } from 'src/providers/file-provider';
import { singleAccountGetter } from '../../providers/account-provider';
import authProvider from '../../providers/auth-provider';
import { SmallAvatar } from '../utils/SmallAvatar';
import TabPanel from '../utils/tab-panel';
import { ACCOUNT_HOLDER_STYLE, BACKDROP_STYLE, BOX_CONTENT_STYLE, SHOW_LAYOUT_STYLE, TAB_STYLE } from './style';

const ProfileLayout = () => (
  <SimpleShowLayout>
    <TextField source='user.firstName' id='firstName' label='Prénom' />
    <TextField source='user.lastName' id='lastName' label='Nom' />
    <TextField source='user.phone' id='phone' label='Téléphone' />
  </SimpleShowLayout>
);

const SubscriptionLayout = () => (
  <SimpleShowLayout>
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${BP_COLOR['solid_grey']}`, pb: 2 }}>
      <Avatar variant='rounded' alt='subscription logo' src='https://www.bpartners.app/static/media/ambitieux.4acee4dedf2cd21425bf.png' />
      <Typography ml={2} variant='h6'>
        L'ambitieux
      </Typography>
    </Box>

    <Box>
      <Typography variant='h6' style={{ color: green[500], mb: 3 }}>
        0€ de coût fixe par mois, au lieu de 20€, grâce à votre pré-inscription !
      </Typography>

      <Typography variant='body2' sx={{ lineHeight: '2' }}>
        200€ de retraits gratuits par mois, puis 1% du montant <br />
        1500€ de plafond de retrait <br />
        2% pour les paiements hors zone euro <br />
        30 virements et prélèvements puis 0,50€ au delà
      </Typography>
    </Box>
  </SimpleShowLayout>
);

const AccountHolderLayout = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const getLogo = async () => {
      const {
        user: { id: userId },
      } = authProvider.getCachedWhoami();
      const apiUrl = process.env.REACT_APP_BPARTNERS_API_URL || '';
      const { accessToken } = authProvider.getCachedAuthConf();
      const accountId = (await singleAccountGetter(userId)).id;
      const fileId = 'logo.jpeg';
      setLogoUrl(`${apiUrl}/accounts/${accountId}/files/${fileId}/raw?accessToken=${accessToken}&fileType=LOGO`);
    };

    getLogo();
  });

  return (
    <Box sx={ACCOUNT_HOLDER_STYLE}>
      <label htmlFor='upload-photo' id='upload-photo-label'>
        <input
          style={{ display: 'none' }}
          id='upload-photo'
          name='upload-photo'
          type='file'
          onChange={async files => {
            try {
              await fileProvider.saveOrUpdate(files);
              notify('Changement enregistré', { type: 'success' });
              refresh();
            } catch (err) {
              notify("Une erreur s'est produite", { type: 'error' });
            }
          }}
        />
        <Badge
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={<SmallAvatar alt='PhotoCamera' children={<PhotoCameraIcon sx={{ color: BP_COLOR[10] }} />} />}
        >
          <Avatar
            alt='company logo'
            src={logoUrl}
            sx={{
              height: '8rem',
              width: '8rem',
            }}
          />
        </Badge>
      </label>

      <Box sx={{ display: 'flex', justifyContent: 'inherit' }}>
        <Typography variant='h5'>
          <TextField source='accountHolder.name' label='Raison sociale' />
        </Typography>
      </Box>
    </Box>
  );
};

const AdditionalInformation = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabChange} variant='fullWidth' sx={TAB_STYLE}>
        <Tab label='Mon identité' />
        <Tab label='Mon abonnement' />
      </Tabs>

      <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
        <ProfileLayout />
      </TabPanel>

      <TabPanel value={tabIndex} index={1} sx={{ p: 3 }}>
        <SubscriptionLayout />
      </TabPanel>
    </Box>
  );
};

const AccountShow = () => {
  const userId = authProvider.getCachedWhoami().user.id;

  return (
    <ShowBase resource='account' basePath='/account' id={userId}>
      <Box sx={SHOW_LAYOUT_STYLE}>
        <Box sx={BOX_CONTENT_STYLE}>
          <AccountHolderLayout />

          <SimpleShowLayout>
            <TextField pb={3} source='accountHolder.postalCode' label='Raison sociale' />
            <TextField pb={3} source='accountHolder.city' label='Citée' />
            <TextField pb={3} source='accountHolder.country' label='Pays' />
            <TextField pb={3} source='accountHolder.address' label='Addresse' />
          </SimpleShowLayout>
        </Box>

        <Box sx={BOX_CONTENT_STYLE}>
          <AdditionalInformation />
        </Box>

        <Box sx={BACKDROP_STYLE}></Box>
      </Box>
    </ShowBase>
  );
};

export default AccountShow;
