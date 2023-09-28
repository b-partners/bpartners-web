import { useEffect, useState } from 'react';
import { List, useListContext, useNotify, useRefresh } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  TextField,
} from '@mui/material';
import { Home, LocalPhoneOutlined, Comment, LocationOn, MailOutline, MoreVert, Star, Update } from '@mui/icons-material';
import { EmptyList } from 'src/common/components/EmptyList';
import ListComponent from 'src/common/components/ListComponent';
import { groupBy } from 'lodash';
import { getGeoJsonUrl } from 'src/common/utils';
import TabPanel from 'src/common/components/TabPanel';
import ProspectsConfiguration from './ProspectsConfiguration';
import { handleSubmit } from 'src/common/utils';
import { prospectingProvider } from 'src/providers';
import { parseRatingLastEvaluation, parseRatingValue } from './utils';
import { CardViewField, ProspectDialog } from './components';
import { prospectInfoResolver } from '../../common/resolvers/prospect-info-validator';
import { FormProvider, useForm } from 'react-hook-form';
import { FieldErrorMessage } from '../../common/resolvers';

const ProspectsList = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label='Mes prospects' />
          <Tab label='Configuration' />
        </Tabs>

        <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
          <List pagination={false} component={ListComponent} actions={false}>
            <Prospects />
          </List>
        </TabPanel>

        <TabPanel value={tabIndex} index={1} sx={{ p: 3 }}>
          <ProspectsConfiguration />
        </TabPanel>
      </Box>
    </>
  );
};

const Prospects = () => {
  const { data, isLoading, setFilters, filterValues } = useListContext();
  const [prospects, setProspects] = useState();

  useEffect(() => {
    data && setProspects(groupBy(sortProspectsByDate(data), 'status'));
  }, [data]);

  if (isLoading) {
    return null;
  }

  function sortProspectsByDate(data) {
    // Sort the prospects by "lastEvaluation" date from most recent to least recent
    const sortedProspects = data.sort((a, b) => {
      const dateA = new Date(a?.rating?.lastEvaluation);
      const dateB = new Date(b?.rating?.lastEvaluation);
      return dateB - dateA;
    });
    return sortedProspects;
  }

  return (
    <Box>
      <TextField
        data-testid='prospect-filter'
        defaultValue={filterValues.searchName}
        label='Rechercher un prospect'
        onChange={e => setFilters({ searchName: e.target.value }, { searchName: e.target.value }, true)}
      />
      {(data || []).length > 0 ? (
        <>
          {prospects ? (
            <Grid container justifyContent='space-between' spacing={2}>
              <ProspectColumn title='À contacter' list={prospects['TO_CONTACT']} color='#005ce6' />
              <ProspectColumn title='Contactés' list={prospects['CONTACTED']} color='#cc0099' />
              <ProspectColumn title='Convertis' list={prospects['CONVERTED']} color='#00cc33' />
            </Grid>
          ) : (
            <EmptyList content='Les données sont en cours de chargement, veuillez patienter.' />
          )}
        </>
      ) : (
        <EmptyList />
      )}
    </Box>
  );
};

const ProspectColumn = props => {
  const { title, list, color } = props;
  return (
    <Grid item xs={4}>
      <Card
        sx={{
          minWidth: 275,
          height: '89vh',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1) !important',
          border: 'none',
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant='h6' color={color}>
                {title}
              </Typography>
            </Box>
            <Stack
              spacing={1}
              sx={{
                overflowY: 'scroll',
                height: '75vh',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {list && list.map(item => <ProspectItem key={`prospect-item-${item.id}`} prospect={item} />)}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

const ProspectItem = ({ prospect }) => {
  const [dialogState, setDialogState] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const notify = useNotify();
  const refresh = useRefresh();

  const toggleDialog = e => {
    e && e.stopPropagation();
    setDialogState(e => !e);
    closePopover();
  };

  const openPopover = event => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const changeStatus = e => {
    const { value } = e.target;
    form.setValue('status', value);
    setSelectedStatus(value);
    toggleDialog();
  };

  const form = useForm({ mode: 'all', defaultValues: prospect || {}, resolver: prospectInfoResolver });

  const saveOrUpdateProspectSubmit = form.handleSubmit(data => {
    const fetch = async () => {
      await prospectingProvider.update([
        {
          ...prospect,
          ...data,
          invoiceID: data?.invoice?.id,
          invoice: undefined,
          status: data.prospectFeedback === 'NOT_INTERESTED' || data.prospectFeedback === 'PROPOSAL_DECLINED' ? 'TO_CONTACT' : data.status,
        },
      ]);
      refresh();
      toggleDialog();
    };
    if (
      prospect.status === 'CONTACTED' &&
      data.prospectFeedback !== 'PROPOSAL_DECLINED' &&
      (!data.contractAmount || data?.contractAmount === 0 || data?.contractAmount?.length === 0)
    ) {
      form.setError('contractAmount', { message: FieldErrorMessage.required });
    } else {
      fetch().catch(() => notify(`Une erreur s'est produite`, { type: 'error' }));
    }
  });

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  if (!prospect.location && !prospect.name && !prospect.email) {
    return null;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(saveOrUpdateProspectSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={2} sx={{ p: 1 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
            <Typography variant='subtitle1' sx={{ textTransform: 'uppercase' }}>
              {prospect.name || 'Non renseigné'}
            </Typography>
            <Stack direction='row' alignItems='center'>
              {prospect.location && (
                <Link href={getGeoJsonUrl(prospect.location)} target='_blank' underline='hover'>
                  <Tooltip title='Voir sur la carte'>
                    <IconButton component='span'>
                      <LocationOn fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
              <Tooltip title='Modifier le status'>
                <IconButton data-testid={`status${prospect.id}`} aria-describedby={id} component='span' onClick={openPopover}>
                  <MoreVert fontSize='small' />
                </IconButton>
              </Tooltip>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Box sx={{ m: 2 }}>
                  <FormControl>
                    <RadioGroup defaultValue={prospect.status} name='status' onChange={handleSubmit(changeStatus)}>
                      <FormControlLabel value='TO_CONTACT' control={<Radio size='small' />} label='À contacter' />
                      <FormControlLabel value='CONTACTED' control={<Radio size='small' />} label='Contacté' />
                      <FormControlLabel value='CONVERTED' control={<Radio size='small' />} label='Converti' />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Popover>
            </Stack>
          </Stack>
          <Box sx={{ color: '#4d4d4d' }}>
            <CardViewField icon={<MailOutline />} value={prospect.email} />
            <CardViewField icon={<LocalPhoneOutlined />} value={prospect.phone} />
            <CardViewField icon={<Home />} value={prospect.address} />
            <CardViewField icon={<Comment />} value={prospect.comment} />
            <CardViewField icon={<Star />} value={parseRatingValue(prospect?.rating?.value)} />
            <CardViewField icon={<Update />} value={parseRatingLastEvaluation(prospect?.rating?.lastEvaluation)} />
          </Box>
          {dialogState ? (
            <ProspectDialog
              open={dialogState}
              close={toggleDialog}
              prospect={prospect}
              saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
              selectedStatus={selectedStatus}
            />
          ) : null}
        </Paper>
      </form>
    </FormProvider>
  );
};

export default ProspectsList;
