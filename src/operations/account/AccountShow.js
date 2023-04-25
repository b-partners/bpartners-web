import {
  Edit as EditIcon,
  LocationOn,
  PhotoCamera as PhotoCameraIcon,
  AccessTime as AccessTimeIcon,
  SmartToy as SmartToyIcon,
  Handyman as HandymanIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { Avatar, Badge, Box, FormControlLabel, FormGroup, IconButton, Link, Skeleton, Switch, Tab, Tabs, Tooltip, Typography, Paper } from '@mui/material';
import { grey, yellow, green } from '@mui/material/colors';
import { useEffect, useState } from 'react';

import { FileType } from 'bpartners-react-client';
import { FunctionField, ShowBase, SimpleShowLayout, TextField, useNotify, useRefresh } from 'react-admin';
import { BP_COLOR } from 'src/bp-theme';
import { fileProvider } from 'src/providers/file-provider';
import { getMimeType } from 'src/common/utils/get-mime-type';
import { v4 as uuid } from 'uuid';
import accountProvider, { cacheUser, getCachedUser, singleAccountGetter } from '../../providers/account-provider';
import authProvider from '../../providers/auth-provider';
import { prettyPrintMinors } from '../../common/utils/money';
import { SmallAvatar } from '../../common/components/SmallAvatar';
import TabPanel from '../../common/components/TabPanel';
import AccountEditionLayout from './AccountEditionLayout';
import { ACCOUNT_HOLDER_STYLE, BACKDROP_STYLE, BOX_CONTENT_STYLE, SHOW_LAYOUT_STYLE } from './style';
import { ACCOUNT_HOLDER_LAYOUT } from './utils';
import { getGeoJsonUrl } from 'src/common/utils/get-geojson-url';

const ProfileLayout = () => {
  const emptyText = 'VIDE';

  return (
    <SimpleShowLayout>
      <TextField source='user.firstName' emptyText={emptyText} id='firstName' label='Prénom' />
      <TextField source='user.lastName' emptyText={emptyText} id='lastName' label='Nom' />
      <TextField source='user.phone' emptyText={emptyText} id='phone' label='Téléphone' />
    </SimpleShowLayout>
  );
};

const InfoShow = ({ content, icon, color, ...others }) => {
  return (
    <Paper
      sx={{ p: 2, background: BP_COLOR['solid_grey'], display: 'flex', justifyContent: 'flex-start', alignItems: 'center', outline: 'none', border: 'none' }}
    >
      <IconButton size='large' sx={{ color, cursor: 'auto' }}>
        {icon}
      </IconButton>
      <Typography ml={3} textAlign='justify' variant='p' {...others}>
        {content}
      </Typography>
    </Paper>
  );
};

const SubscriptionLayout = () => (
  <SimpleShowLayout>
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${BP_COLOR['solid_grey']}`, pb: 2, mb: 2 }}>
      <Avatar
        variant='rounded'
        sx={{ background: BP_COLOR[5] }}
        alt='Votre abonnement'
        src='https://www.bpartners.app/static/media/essentiel.cb090d9cf088f1bc56cf.png'
      />
      <Box ml={2}>
        <Typography variant='h5'>L'essentiel</Typography>
        <Typography color='text.secondary' variant='b'>
          Tous les services essentiels pour gérer votre activité d'artisan ou d'indépendant
        </Typography>
      </Box>
    </Box>

    <Typography variant='h6'>Pour 7€ HT par mois:</Typography>
    <InfoShow
      content='Activation de notre Intelligence artificielle qui génère des prospects en temps réel pour développer votre activité et obtenir de nouveaux clients.'
      icon={<SmartToyIcon />}
      color={grey[500]}
    />
    <InfoShow
      content='Accès aux outils de devis/facturation personnalisé, gestion des acomptes, relance impayés CRM, gestion des produits, synchronisation bancaire et suivi de trésorerie.'
      icon={<HandymanIcon />}
      color={yellow[800]}
    />
    <InfoShow
      content='Initiez la collecte de vos encaissements instantanément par QR code, Mails ou SMS en 1 clic. Lien de paiement intégré à la facture pour seulement
      0,99%'
      icon={<QrCodeIcon />}
      color='#000'
    />
    <InfoShow content='Support 7/7' icon={<AccessTimeIcon />} color={green[500]} />
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
      await accountProvider.saveOrUpdate([{ ...data.accountHolder.companyInfo, isSubjectToVat: !checked }]);
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
        control={<Switch disabled={isLoading} checked={!data.accountHolder.companyInfo.isSubjectToVat} onChange={handleChange} />}
        label={!data.accountHolder.companyInfo.isSubjectToVat ? 'Oui' : 'Non'}
      />
    </FormGroup>
  );
};

const IncomeTargets = ({ revenueTargets }) => {
  const currentYear = new Date().getFullYear();
  const currentIncomeTarget = revenueTargets.filter(item => item.year === currentYear);
  const currentIncomeTargetValue = currentIncomeTarget[0]
    ? prettyPrintMinors(currentIncomeTarget[0].amountTarget)
    : `Vous n'avez pas encore défini votre objectif pour cette année.`;

  return <span>{currentIncomeTargetValue}</span>;
};

const BPLocationView = ({ location }) => {
  return (
    <>
      {location ? (
        <Tooltip title={`lat: ${location.latitude}, lng: ${location.longitude}`}>
          <Link href={getGeoJsonUrl(location)} target='_blank' underline='hover'>
            <IconButton component='span'>
              <LocationOn fontSize='small' />
            </IconButton>
            <Typography variant='caption'> Voir sur la carte</Typography>
          </Link>
        </Tooltip>
      ) : (
        <Typography variant='caption'>Vous n'avez pas encore renseigné vos coordonnées géographiques.</Typography>
      )}
    </>
  );
};

const AccountHolderLayout = props => {
  const { toggleAccountHolderLayout } = props;
  const emptyText = 'VIDE';

  return (
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
      <IconButton onClick={toggleAccountHolderLayout} sx={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <EditIcon />
      </IconButton>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='accountHolder.name' emptyText={emptyText} label='Raison sociale' />
        <TextField pb={3} source='accountHolder.businessActivities.primary' emptyText={emptyText} label='Activité principale' />
        <TextField pb={3} source='accountHolder.businessActivities.secondary' emptyText={emptyText} label='Activité secondaire' />
        <TextField pb={3} source='accountHolder.officialActivityName' emptyText={emptyText} label='Activité officielle' />
        <FunctionField
          pb={3}
          render={data => <Typography>{prettyPrintMinors(data.accountHolder.companyInfo.socialCapital)}</Typography>}
          label='Capital social'
        />
        <FunctionField pb={3} render={record => <IncomeTargets revenueTargets={record.accountHolder.revenueTargets} />} label='Recette annuelle à réaliser' />
        <TextField pb={3} source='accountHolder.siren' label='Siren' />
        <FunctionField pb={3} render={SubjectToVatSwitch} label='Micro-entreprise exonérée de TVA' />
      </SimpleShowLayout>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='accountHolder.contactAddress.city' emptyText={emptyText} label='Ville' />
        <TextField pb={3} source='accountHolder.contactAddress.country' emptyText={emptyText} label='Pays' />
        <TextField pb={3} source='accountHolder.contactAddress.address' emptyText={emptyText} label='Adresse' />
        <TextField pb={3} source='accountHolder.contactAddress.postalCode' emptyText={emptyText} label='Code postal' />
        <TextField pb={3} source='accountHolder.companyInfo.townCode' emptyText={emptyText} label='Code de la commune de prospection' />
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
      <Tabs value={tabIndex} onChange={handleTabChange} variant='fullWidth'>
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
