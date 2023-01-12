import { green, grey } from '@mui/material/colors';
import { Save as SaveIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Autocomplete, Avatar, Badge, Box, Button, CircularProgress, Skeleton, Tab, Tabs, Tooltip, Typography, TextField as MuiTextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { ShowBase, SimpleShowLayout, TextField, useNotify } from 'react-admin';
import { BP_COLOR } from 'src/bpTheme';
import { userAccountsApi } from 'src/providers/api';
import { fileProvider } from 'src/providers/file-provider';
import { accountHoldersGetter, cacheAccountHolder, cacheUser, getCachedUser, singleAccountGetter } from '../../providers/account-provider';
import authProvider from '../../providers/auth-provider';
import { SmallAvatar } from '../utils/SmallAvatar';
import TabPanel from '../utils/TabPanel';
import { ACCOUNT_HOLDER_STYLE, BACKDROP_STYLE, BOX_CONTENT_STYLE, SHOW_LAYOUT_STYLE, TAB_STYLE } from './style';
import { v4 as uuid } from 'uuid';
import { getMimeType } from 'src/utils/get-mime-type';
import { FileType } from 'bpartners-react-client';

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

const AccountHolderLayout = () => {
  const notify = useNotify();
  const [accountHolders, setAccountHolders] = useState({});
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [jobList, setJobList] = useState([]);

  const [primaryActivity, setPrimaryActivity] = useState('');
  const [inputPrimaryActivity, setInputPrimaryActivity] = useState('');

  const [secondaryActivity, setSecondaryActivity] = useState('');
  const [inputSecondaryActivity, setInputSecondaryActivity] = useState('');

  const activityTooltipTitle = "Sélectionner votre métier sur la liste. S'il n'y figure pas, veuillez le saisir directement dans le champ de saisie.";

  const updateBusinessActivities = async () => {
    const {
      user: { id: userId },
    } = authProvider.getCachedWhoami();
    const accountId = (await singleAccountGetter(userId)).id;
    const { id } = accountHolders;
    const body = {
      primary: primaryActivity,
      secondary: secondaryActivity,
    };
    setIsLoading(true);
    try {
      const { data } = await userAccountsApi().updateBusinessActivities(userId, accountId, id, body);
      notify('Changement enregistré', { type: 'success' });
      cacheAccountHolder(data);
      setIsBtnDisabled(true);
      setIsLoading(false);
    } catch (error) {
      notify("Une erreur s'est produite", { type: 'error' });
      setIsLoading(false);
    }
  };

  const validateActivity = (activityValue, setActivityValue, inputActivityValue) => {
    const {
      businessActivities: { primary, secondary },
    } = accountHolders;
    setActivityValue(activityValue && activityValue === inputActivityValue ? activityValue : inputActivityValue);
    setIsBtnDisabled((primaryActivity !== primary || secondaryActivity !== secondary) && primaryActivity && secondaryActivity ? false : true);
  };

  useEffect(() => {
    const getAccountHolders = async () => {
      const {
        user: { id: userId },
      } = authProvider.getCachedWhoami();
      const aHolders = await accountHoldersGetter(userId);
      const {
        businessActivities: { primary, secondary },
      } = aHolders;

      setAccountHolders(aHolders);
      setPrimaryActivity(primary);
      setSecondaryActivity(secondary);
    };

    const getBusinessActivities = async () => {
      const { data } = await userAccountsApi().getBusinessActivities(1, 100);
      setJobList(data.map(({ name }) => name));
    };

    getBusinessActivities();
    getAccountHolders();
  }, []);

  return (
    <>
      <Box sx={{ padding: 2 }}>
        <Tooltip title={activityTooltipTitle}>
          <Autocomplete
            value={primaryActivity}
            onChange={(event, newValue) => {
              setPrimaryActivity(newValue);
            }}
            inputValue={inputPrimaryActivity}
            onInputChange={(event, newInputValue) => {
              setInputPrimaryActivity(newInputValue);
            }}
            onBlur={() => {
              validateActivity(primaryActivity, setPrimaryActivity, inputPrimaryActivity);
            }}
            id='primary-activity'
            sx={{ width: '45%', marginRight: 1, display: 'inline-block' }}
            options={jobList}
            renderInput={params => <MuiTextField {...params} label='Activité principale' />}
          />
        </Tooltip>
        <Tooltip title={activityTooltipTitle}>
          <Autocomplete
            value={secondaryActivity}
            onChange={(event, newValue) => {
              setSecondaryActivity(newValue);
            }}
            inputValue={inputSecondaryActivity}
            onInputChange={(event, newInputValue) => {
              setInputSecondaryActivity(newInputValue);
            }}
            onBlur={() => {
              validateActivity(secondaryActivity, setSecondaryActivity, inputSecondaryActivity);
            }}
            id='secondary-activity'
            sx={{ width: '45%', display: 'inline-block' }}
            options={jobList}
            renderInput={params => <MuiTextField {...params} label='Activité secondaire' />}
          />
        </Tooltip>
        <Button
          variant='contained'
          size='small'
          startIcon={isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
          disabled={isBtnDisabled}
          onClick={updateBusinessActivities}
          sx={{ marginTop: 1 }}
        >
          Enregistrer
        </Button>
      </Box>

      <SimpleShowLayout>
        <TextField pb={3} source='accountHolder.name' label='Raison sociale' />
        <TextField pb={3} source='accountHolder.officialActivityName' label='Activité officielle' />
        <TextField pb={3} source='accountHolder.companyInfo.socialCapital' label='Capital Social' />
        <TextField pb={3} source='accountHolder.companyInfo.tvaNumber' label='Numéro TVA' />
        <TextField pb={3} source='accountHolder.siren' label='Siren' />
        <TextField pb={3} source='accountHolder.contactAddress.city' label='Ville' />
        <TextField pb={3} source='accountHolder.contactAddress.country' label='Pays' />
        <TextField pb={3} source='accountHolder.contactAddress.address' label='Adresse' />
        <TextField pb={3} source='accountHolder.contactAddress.postalCode' label='Code postal' />
      </SimpleShowLayout>
    </>
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
        <Tab label='Ma société' />
        <Tab label='Mon abonnement' />
      </Tabs>

      <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
        <AccountHolderLayout />
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
          <LogoLayout />
          <ProfileLayout />
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
