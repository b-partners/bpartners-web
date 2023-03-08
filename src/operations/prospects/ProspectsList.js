import { useEffect, useState } from 'react';
import { List, useListContext } from 'react-admin';
import { Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material';
import { LocalPhoneOutlined, MailOutline } from '@mui/icons-material';
import { EmptyList } from 'src/common/components/EmptyList';
import ListComponent from 'src/common/components/ListComponent';
import { groupBy } from 'lodash';
import { BP_COLOR } from 'src/bp-theme';

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

  return (data || []).length > 0 && prospects ? (
    <>
      <Grid container justifyContent='space-between' spacing={2}>
        <ProspectColumn title='À contacter' list={prospects['TO_CONTACT']} color='#005ce6' />
        <ProspectColumn title='Contactés' list={prospects['CONTACTED']} color='#cc0099' />
        <ProspectColumn title='Convertis' list={prospects['CONVERTED']} color='#33ff33' />
      </Grid>
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
  return (
    <Paper elevation={2} sx={{ p: 1 }}>
      <Typography variant='subtitle1' sx={{ textTransform: 'uppercase' }}>
        {prospect.name || 'Non renseigné'}
      </Typography>
      <Typography variant='body2'>
        <MailOutline fontSize='small' sx={{ position: 'relative', top: 4 }} /> {prospect.email || 'Non renseigné'}
      </Typography>
      <Typography variant='body2'>
        <LocalPhoneOutlined fontSize='small' sx={{ position: 'relative', top: 4 }} /> {prospect.phone || 'Non renseigné'}
      </Typography>
    </Paper>
  );
};

export default ProspectsList;
