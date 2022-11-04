import { green } from '@material-ui/core/colors';
import { Save } from '@material-ui/icons';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Autocomplete, Avatar, Badge, Box, Button, CircularProgress, Tab, Tabs, Typography, TextField as MuiTextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { ShowBase, SimpleShowLayout, TextField, useNotify, useRefresh } from 'react-admin';
import { BP_COLOR } from 'src/bpTheme';
import { userAccountsApi } from 'src/providers/api';
import { fileProvider } from 'src/providers/file-provider';
import { accountHoldersGetter, singleAccountGetter } from '../../providers/account-provider';
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

const LogoLayout = () => {
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
      const aHolders = await userAccountsApi().updateBusinessActivities(userId, accountId, id, body);
      notify('Changement enregistré', { type: 'success' });
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
        <Button
          variant='contained'
          size='small'
          startIcon={isLoading ? <CircularProgress color='inherit' size={18} /> : <Save />}
          disabled={isBtnDisabled}
          onClick={updateBusinessActivities}
          sx={{ marginTop: 1 }}
        >
          Enregistrer
        </Button>
      </Box>

      <SimpleShowLayout>
        <TextField pb={3} source='accountHolder.officialActivityName' label='Activité officielle' />
        <TextField pb={3} source='accountHolder.contactAddress.postalCode' label='Raison sociale' />
        <TextField pb={3} source='accountHolder.contactAddress.city' label='Citée' />
        <TextField pb={3} source='accountHolder.contactAddress.country' label='Pays' />
        <TextField pb={3} source='accountHolder.contactAddress.address' label='Addresse' />
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
