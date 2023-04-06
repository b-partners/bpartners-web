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
  Tooltip,
  Typography,
} from '@mui/material';
import { Home, LocalPhoneOutlined, LocationCity, LocationOn, MailOutline, MoreVert } from '@mui/icons-material';
import { EmptyList } from 'src/common/components/EmptyList';
import ListComponent from 'src/common/components/ListComponent';
import { groupBy } from 'lodash';
import { BP_COLOR } from 'src/bp-theme';
import { getGeoJsonUrl } from 'src/common/utils/get-geojson-url';
import prospectingProvider from 'src/providers/prospecting-provider';

const ProspectsList = () => {
  return (
    <>
      <List pagination={false} component={ListComponent} actions={false}>
        <Prospects />
      </List>
    </>
  );
};

const Prospects = () => {
  const { data, isLoading } = useListContext();
  const [prospects, setProspects] = useState();

  useEffect(() => {
    data && setProspects(groupBy(data, 'status'));
  }, [data]);

  if (isLoading) {
    return null;
  }

  return (data || []).length > 0 ? (
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
  );
};

const ProspectColumn = props => {
  const { title, list, color } = props;
  return (
    <Grid item xs={4}>
      <Card sx={{ minWidth: 275, height: '89vh', bgcolor: BP_COLOR['solid_grey'] }}>
        <CardContent>
          <Stack spacing={3}>
            <Paper elevation={3} sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant='h6' color={color}>
                {title}
              </Typography>
            </Paper>
            <Stack spacing={1} sx={{ overflowY: 'scroll', height: '75vh', '&::-webkit-scrollbar': { display: 'none' } }}>
              {list && list.map(item => <ProspectItem prospect={item} />)}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

const ProspectItem = ({ prospect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();

  const openPopover = event => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const changeStatus = async e => {
    const { value } = e.target;
    try {
      await prospectingProvider.saveOrUpdate([{ ...prospect, status: value }]);
      refresh();
      closePopover();
      notify('Changement effectué', { type: 'success' });
    } catch (error) {
      notify(`Une erreur s'est produite`, { type: 'error' });
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  if (!prospect.location && !prospect.name && !prospect.email) {
    return null;
  }

  return (
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
                <RadioGroup aria-labelledby='demo-radio-buttons-group-label' defaultValue={prospect.status} name='radio-buttons-group' onChange={changeStatus}>
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
        <Typography variant='body2'>
          <MailOutline fontSize='small' sx={{ position: 'relative', top: 4 }} /> {prospect.email || 'Non renseigné'}
        </Typography>
        <Typography variant='body2'>
          <LocalPhoneOutlined fontSize='small' sx={{ position: 'relative', top: 4 }} /> {prospect.phone || 'Non renseigné'}
        </Typography>
        <Typography variant='body2'>
          <Home fontSize='small' sx={{ position: 'relative', top: 4 }} /> {prospect.address || 'Non renseigné'}
        </Typography>
        <Typography variant='body2'>
          <LocationCity fontSize='small' sx={{ position: 'relative', top: 4 }} /> {prospect.townCode || 'Non renseigné'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProspectsList;
