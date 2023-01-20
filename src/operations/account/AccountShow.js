import { green, grey } from '@mui/material/colors';
import { Edit as EditIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Avatar, Badge, Box, IconButton, Skeleton, Tab, Tabs, Typography, Switch, FormGroup, FormControlLabel } from '@mui/material';
import { useEffect, useState } from 'react';

import { FunctionField, ShowBase, SimpleShowLayout, TextField, useNotify, useRefresh } from 'react-admin';
import { BP_COLOR } from 'src/bpTheme';
import { fileProvider } from 'src/providers/file-provider';
import accountProvider, { cacheUser, getCachedUser, singleAccountGetter } from '../../providers/account-provider';
import authProvider from '../../providers/auth-provider';
import { SmallAvatar } from '../utils/SmallAvatar';
import TabPanel from '../utils/TabPanel';
import { ACCOUNT_HOLDER_STYLE, BACKDROP_STYLE, BOX_CONTENT_STYLE, SHOW_LAYOUT_STYLE, TAB_STYLE, BP_SWITCH_STYLE } from './style';
import { v4 as uuid } from 'uuid';
import { getMimeType } from 'src/utils/get-mime-type';
import { FileType } from 'bpartners-react-client';
import { ACCOUNT_HOLDER_LAYOUT } from './utils';
import AccountEditionLayout from './AccountEditionLayout';

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
      <Avatar variant='rounded' alt='Votre abonnement' src='https://www.bpartners.app/static/media/essentiel.cb090d9cf088f1bc56cf.png' />
      <Typography ml={2} variant='h6'>
        L'essentiel
      </Typography>
    </Box>

    <Box>
      <Typography variant='h7' style={{ color: green[500], mb: 3 }}>
        <b>0€</b> de coût fixe par mois, au lieu de 7€, car vous avez accepté d'être beta-testeur !
      </Typography>

      <Typography variant='body2' sx={{ lineHeight: '2' }}>
        <b>0%</b> de frais sur les encaissements par mail et QR code sous 1k€, puis 1.5% si au-delà <br />
        <b>0€</b> sur les 20 premières initiations de virements, puis 0.40€ par virement si au-delà <br />
        <b>0%</b> de commission sur les mouvements annuels sous 60k€, puis 0.15% si au-delà <br />
        <b>1 Mastercard</b> offerte, puis 5€ par mois par carte supplémentaire <br />
        <b>1 assistant virtuel</b> pour développer votre activité <br />
      </Typography>
    </Box>
  </SimpleShowLayout>
);

const LogoLayout = () => {
  const notify = useNotify();
  const [logo, setLogo] = useState(undefined);
  const [logoLoading, setLogoLoading] = useState(false);

  const getLogo = async () => {
    const {
      user: { id: userId },
    } = authProvider.getCachedWhoami();
    const logoFileId = getCachedUser() && getCachedUser().logoFileId;

    if (!logoFileId) {
      return;
    }

    const { accessToken } = authProvider.getCachedAuthConf();
    const accountId = (await singleAccountGetter(userId)).id;
    const url = `${process.env.REACT_APP_BPARTNERS_API_URL}/accounts/${accountId}/files/${logoFileId}/raw?accessToken=${accessToken}&fileType=LOGO`;

    try {
      setLogoLoading(true);
      const result = await fetch(url);
      const blob = await result.blob();
      setLogo(URL.createObjectURL(blob));
    } catch (e) {
      throw e;
    } finally {
      setLogoLoading(false);
    }
  };

  const updateLogo = async files => {
    try {
      setLogoLoading(true);
      const type = getMimeType(files);
      const [, logoExtension] = type.split('/');
      const logoFileId = `${uuid()}.${logoExtension}`;
      const user = getCachedUser();

      const resources = { files: files, fileId: logoFileId, fileType: FileType.LOGO };

      await fileProvider.saveOrUpdate(resources);

      notify('Téléchargement du logo terminé, les modifications seront propagées dans quelques instants.', { type: 'success' });

      cacheUser({ ...user, logoFileId: logoFileId });
    } catch (err) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      await getLogo();
    }
  };

  useEffect(() => {
    getLogo();
  }, []);

  return (
    <Box sx={ACCOUNT_HOLDER_STYLE}>
      <label htmlFor='upload-photo' id='upload-photo-label'>
        <input style={{ display: 'none' }} id='upload-photo' name='upload-photo' type='file' onChange={updateLogo} />
        <Badge
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={<SmallAvatar alt='PhotoCamera' children={<PhotoCameraIcon sx={{ color: BP_COLOR[10] }} />} />}
        >
          {!logoLoading ? (
            <Avatar
              alt='company logo'
              src={logo}
              sx={{
                height: '8rem',
                width: '8rem',
              }}
            />
          ) : (
            <Skeleton animaiton='wave' variant='circular' width={128} height={128} sx={{ bgcolor: grey[400] }} />
          )}
        </Badge>
      </label>
    </Box>
  );
};

const SubjectToVatSwitch = data => {
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleChange = async (_event, checked) => {
    try {
      setLoading(true);
      await accountProvider.saveOrUpdate([{ ...data.accountHolder.companyInfo, isSubjectToVat: checked }]);
      refresh();
    } catch (_err) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch disabled={isLoading} checked={data.accountHolder.companyInfo.isSubjectToVat} sx={BP_SWITCH_STYLE} onChange={handleChange} />}
        label={data.accountHolder.companyInfo.isSubjectToVat ? 'Oui' : 'Non'}
      />
    </FormGroup>
  );
};

const AccountHolderLayout = props => {
  const { toggleAccountHolderLayout } = props;
  return (
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
      <IconButton onClick={toggleAccountHolderLayout} sx={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <EditIcon />
      </IconButton>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='accountHolder.name' label='Raison sociale' />
        <TextField pb={3} source='accountHolder.businessActivities.primary' label='Activité principale' />
        <TextField pb={3} source='accountHolder.businessActivities.secondary' label='Activité secondaire' />
        <TextField pb={3} source='accountHolder.officialActivityName' label='Activité officielle' />
        <TextField pb={3} source='accountHolder.companyInfo.socialCapital' label='Capital Social' />
        <TextField pb={3} source='accountHolder.siren' label='Siren' />
      </SimpleShowLayout>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='accountHolder.contactAddress.city' label='Ville' />
        <TextField pb={3} source='accountHolder.contactAddress.country' label='Pays' />
        <TextField pb={3} source='accountHolder.contactAddress.address' label='Adresse' />
        <TextField pb={3} source='accountHolder.contactAddress.postalCode' label='Code postal' />
        <FunctionField pb={3} render={SubjectToVatSwitch} label='Micro-entreprise exonéré de TVA' />
      </SimpleShowLayout>
    </Box>
  );
};

const AdditionalInformation = props => {
  const { toggleAccountHolderLayout } = props;
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabChange} variant='fullWidth' sx={TAB_STYLE}>
        <Tab label='Ma société' />
        <Tab label='Mon abonnement' />
      </Tabs>

      <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
        <AccountHolderLayout toggleAccountHolderLayout={toggleAccountHolderLayout} />
      </TabPanel>

      <TabPanel value={tabIndex} index={1} sx={{ p: 3 }}>
        <SubscriptionLayout />
      </TabPanel>
    </Box>
  );
};

const AccountShow = () => {
  const userId = authProvider.getCachedWhoami().user.id;
  const [layout, setLayout] = useState(ACCOUNT_HOLDER_LAYOUT.VIEW);
  const refresh = useRefresh();

  const toggleAccountHolderLayout = () => {
    setLayout(property => (property === ACCOUNT_HOLDER_LAYOUT.VIEW ? ACCOUNT_HOLDER_LAYOUT.CONFIGURATION : ACCOUNT_HOLDER_LAYOUT.VIEW));
    refresh();
  };

  return (
    <ShowBase resource='account' basePath='/account' id={userId}>
      {layout === ACCOUNT_HOLDER_LAYOUT.VIEW ? (
        <Box sx={SHOW_LAYOUT_STYLE}>
          <Box sx={BOX_CONTENT_STYLE}>
            <LogoLayout />
            <ProfileLayout />
          </Box>

          <Box sx={BOX_CONTENT_STYLE}>
            <AdditionalInformation toggleAccountHolderLayout={toggleAccountHolderLayout} />
          </Box>

          <Box sx={BACKDROP_STYLE}></Box>
        </Box>
      ) : (
        <AccountEditionLayout onClose={toggleAccountHolderLayout} />
      )}
    </ShowBase>
  );
};

export default AccountShow;
