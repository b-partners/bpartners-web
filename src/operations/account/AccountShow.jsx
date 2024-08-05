import {
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Handyman as HandymanIcon,
  PhotoCamera as PhotoCameraIcon,
  QrCode as QrCodeIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { Avatar, Badge, Box, FormControlLabel, FormGroup, IconButton, Paper, Skeleton, Switch, Tab, Tabs, Typography } from '@mui/material';
import { green, grey, yellow } from '@mui/material/colors';
import { useEffect, useState } from 'react';

import { BP_COLOR } from '@/bp-theme';
import { RaMoneyField } from '@/common/components';
import { getMimeType, prettyPrintMinors, printError } from '@/common/utils';
import { accountHolderProvider, cache, fileProvider, getAccountLogoUrl, getCached } from '@/providers';
import { FileType } from '@bpartners/typescript-client';
import { FunctionField, ShowBase, SimpleShowLayout, TextField, useNotify, useRefresh } from 'react-admin';
import { v4 as uuid } from 'uuid';
import { SmallAvatar } from '../../common/components/SmallAvatar';
import TabPanel from '../../common/components/TabPanel';
import AccountEditionLayout from './AccountEditionLayout';
import { FeedbackLink } from './components';
import { ACCOUNT_HOLDER_STYLE, BACKDROP_STYLE, BOX_CONTENT_STYLE, SHOW_LAYOUT_STYLE } from './style';
import { ACCOUNT_HOLDER_LAYOUT } from './utils';

const ProfileLayout = () => {
  const emptyText = 'VIDE';

  return (
    <SimpleShowLayout>
      <TextField source='user.firstName' emptyText={emptyText} id='firstName' label='Prénom' />
      <TextField source='user.lastName' emptyText={emptyText} id='lastName' label='Nom' />
      <TextField source='user.phone' emptyText={emptyText} id='phone' label='Téléphone' />
      <FunctionField label='Lien du feedback' render={data => <FeedbackLink link={data?.feedback?.feedbackLink} />} />
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
    const logoUrl = getAccountLogoUrl();
    if (logoUrl) {
      try {
        setLogoLoading(true);
        const result = await fetch(logoUrl);
        const blob = await result.blob();
        setLogo(URL.createObjectURL(blob));
      } catch (e) {
        throw e;
      } finally {
        setLogoLoading(false);
      }
    }
    return null;
  };

  const handleUpdateLogo = files => {
    const updateLogo = async () => {
      setLogoLoading(true);
      const type = getMimeType(files);
      const [, logoExtension] = type.split('/');
      const logoFileId = `${uuid()}.${logoExtension}`;

      const resources = { files: files, fileId: logoFileId, fileType: FileType.LOGO };
      await fileProvider.saveOrUpdate(resources);

      notify('Téléchargement du logo terminé, les modifications seront propagées dans quelques instants.', { type: 'success' });
      const user = getCached.user();
      const whoami = getCached.whoami();
      cache.user({ ...user, logoFileId: logoFileId });
      cache.whoami({ ...whoami, user: { ...user, logoFileId: logoFileId } });
      getLogo().catch(printError);
    };

    updateLogo()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => {
        getLogo().catch(printError);
      });
  };

  useEffect(() => {
    getLogo().catch(printError);
  }, []);

  return (
    <Box sx={ACCOUNT_HOLDER_STYLE}>
      <label htmlFor='upload-photo' style={{ cursor: 'pointer' }} id='upload-photo-label'>
        <input style={{ display: 'none' }} id='upload-photo' name='upload-photo' type='file' onChange={handleUpdateLogo} />
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
            <Skeleton animation='wave' variant='circular' width={128} height={128} sx={{ bgcolor: grey[400] }} />
          )}
        </Badge>
      </label>
    </Box>
  );
};

const SubjectToVatSwitch = ({ data }) => {
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleChange = (_event, checked) => {
    const fetch = async () => {
      await accountHolderProvider.saveOrUpdate([{ ...data?.companyInfo, isSubjectToVat: !checked }]);
      refresh();
    };
    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch disabled={isLoading} checked={!data?.companyInfo?.isSubjectToVat} onChange={handleChange} />}
        label={!data?.companyInfo?.isSubjectToVat ? 'Oui' : 'Non'}
      />
    </FormGroup>
  );
};

const IncomeTargets = ({ revenueTargets }) => {
  const currentYear = new Date().getFullYear();
  const currentIncomeTarget = revenueTargets?.filter(item => item.year === currentYear);
  const currentIncomeTargetValue =
    currentIncomeTarget && currentIncomeTarget[0]
      ? prettyPrintMinors(currentIncomeTarget[0].amountTarget)
      : `Vous n'avez pas encore défini votre objectif pour cette année.`;

  return <span>{currentIncomeTargetValue}</span>;
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
        <TextField pb={3} source='name' emptyText={emptyText} label='Raison sociale' />
        <TextField pb={3} source='businessActivities.primary' emptyText={emptyText} label='Activité principale' />
        <TextField pb={3} source='businessActivities.secondary' emptyText={emptyText} label='Activité secondaire' />
        <TextField pb={3} source='officialActivityName' emptyText={emptyText} label='Activité officielle' />
        <RaMoneyField pb={3} render={data => data?.companyInfo?.socialCapital} label='Capital social' />
        <FunctionField pb={3} render={record => <IncomeTargets revenueTargets={record.revenueTargets} />} label='Encaissement annuelle à réaliser' />
        <TextField pb={3} source='siren' label='Siren' />
        <FunctionField pb={3} render={data => <SubjectToVatSwitch data={data} />} label='Micro-entreprise exonérée de TVA' />
      </SimpleShowLayout>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='contactAddress.city' emptyText={emptyText} label='Ville' />
        <TextField pb={3} source='contactAddress.country' emptyText={emptyText} label='Pays' />
        <TextField pb={3} source='contactAddress.address' emptyText={emptyText} label='Adresse' />
        <TextField pb={3} source='contactAddress.postalCode' emptyText={emptyText} label='Code postal' />
        <TextField pb={3} source='companyInfo.townCode' emptyText={emptyText} label='Code de la commune de prospection' />
        <TextField pb={3} source='companyInfo.tvaNumber' emptyText={emptyText} label='Numéro de TVA' />
        <TextField pb={3} source='companyInfo.website' emptyText={emptyText} label='Site Web' />
      </SimpleShowLayout>
    </Box>
  );
};

const AdditionalInformation = props => {
  const { toggleAccountHolderLayout } = props;
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_event, newTabIndex) => {
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
  const [layout, setLayout] = useState(ACCOUNT_HOLDER_LAYOUT.VIEW);
  const refresh = useRefresh();

  const toggleAccountHolderLayout = () => {
    setLayout(property => (property === ACCOUNT_HOLDER_LAYOUT.VIEW ? ACCOUNT_HOLDER_LAYOUT.CONFIGURATION : ACCOUNT_HOLDER_LAYOUT.VIEW));
    refresh();
  };

  return (
    <ShowBase id='' resource='accountHolder' basePath='/account'>
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
