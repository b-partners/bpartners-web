import { Storefront } from '@mui/icons-material';
import { Avatar, Box, Grid, Link, Typography } from '@mui/material';
import React, { useState } from 'react';
import { List, RecordContextProvider, useListContext } from 'react-admin';
import { BP_COLOR } from '../../bpTheme';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';
import { AVATAR_CONTAINER_STYLE, AVATAR_STYLE, BACKDROP_STYLE, BOX_CONTAINER_STYLE, DETAIL_CONTAINER_STYLE } from './style';

const MarketplaceList = () => (
  <List sort={{ field: 'name', order: 'ASC' }} perPage={20} pagination={false} component={ListComponent} actions={false}>
    <MarketplaceGrid />
  </List>
);

const MarketplaceGrid = () => {
  const [showMore, setShowMore] = useState(null);

  const handleShowMore = index => {
    setShowMore(prev => (prev === index ? null : index));
  };

  const { data, isLoading } = useListContext();
  if (isLoading) {
    return null;
  }

  return (data || []).length > 0 ? (
    <Grid container spacing={4} sx={{ marginTop: '1em' }}>
      {data.map((record, index) => {
        const { name, logoUrl, description, websiteUrl } = record;

        return (
          <RecordContextProvider key={record.id} value={record}>
            <Grid key={record.id} xs={12} sm={12} md={4} item sx={{ width: '100%' }}>
              <Box sx={BOX_CONTAINER_STYLE}>
                <Box sx={{ paddingInline: '1.8rem' }}>
                  <Box sx={BACKDROP_STYLE[2]}></Box>
                  <Box sx={AVATAR_CONTAINER_STYLE}>
                    <Avatar sx={AVATAR_STYLE} src={logoUrl}>
                      <Storefront />
                    </Avatar>

                    <Typography variant='body1' component='b' sx={{ fontWeight: '600', mb: 5 }}>
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

                  <Box onClick={() => handleShowMore(index)} sx={{ paddingBlock: 2 }}>
                    <Typography variant='body2' component='p' sx={{ cursor: showMore === index ? 'text' : 'pointer' }}>
                      {description.slice(0, 20)}
                      {showMore === index ? description.slice(20) : <code title='lire la suite'>...</code>}
                    </Typography>
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
