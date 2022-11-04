import { Box, Grid, Avatar, Typography, Link } from '@mui/material';
import { Storefront } from '@material-ui/icons';
import { List, RecordContextProvider, useListContext } from 'react-admin';
import { BP_COLOR } from '../../bpTheme';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';
import { AVATAR_CONTAINER_STYLE, DETAIL_CONTAINER_STYLE, BACKDROP_STYLE, AVATAR_STYLE, BOX_CONTAINER_STYLE } from './style';

const MarketplaceList = () => (
  <List sort={{ field: 'name', order: 'ASC' }} perPage={20} pagination={false} component={ListComponent} actions={false}>
    <MarketplaceGrid />
  </List>
);

const MarketplaceGrid = () => {
  const { data, isLoading } = useListContext();
  if (isLoading) {
    return null;
  }

  return (data || []).length > 0 ? (
    <Grid container spacing={4} sx={{ marginTop: '1em' }}>
      {data.map(record => {
        const { name, logoUrl, description, phoneNumber, websiteUrl } = record;

        return (
          <RecordContextProvider key={record.id} value={record}>
            <Grid key={record.id} xs={12} sm={12} md={6} item sx={{ width: '100%' }}>
              <Box sx={BOX_CONTAINER_STYLE}>
                <Box sx={{ paddingInline: '1.8rem' }}>
                  <Box sx={BACKDROP_STYLE[1]}>
                    <Typography variant='body2'>{phoneNumber}</Typography>
                  </Box>

                  <Box sx={BACKDROP_STYLE[2]}></Box>

                  <Box sx={AVATAR_CONTAINER_STYLE}>
                    <Avatar sx={AVATAR_STYLE} src={logoUrl}>
                      <Storefront />
                    </Avatar>

                    <Typography variant='body1' component='b' sx={{ fontWeight: '600', mb: 3 }}>
                      {name}
                    </Typography>
                  </Box>

                  <Box sx={{ ...DETAIL_CONTAINER_STYLE, borderBottom: `1px solid ${BP_COLOR['solid_grey']}` }}>
                    <Typography variant='caption'>
                      site web:{' '}
                      <Link data-testid={`link-${websiteUrl}`} href={websiteUrl} target='_blank'>
                        {name}
                      </Link>
                    </Typography>
                  </Box>

                  <Box sx={{ ...DETAIL_CONTAINER_STYLE, height: '8rem' }}>
                    <Typography variant='caption'>{description}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </RecordContextProvider>
        );
      })}
    </Grid>
  ) : (
    <EmptyList />
  );
};

export default MarketplaceList;
