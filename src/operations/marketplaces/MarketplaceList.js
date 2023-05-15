import React, { useState } from 'react';
import ListComponent from '../../common/components/ListComponent';
import { List, RecordContextProvider, useListContext } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import { Storefront } from '@mui/icons-material';
import { Avatar, Box, Grid, Link, Typography, Alert } from '@mui/material';
import { BP_COLOR } from '../../bp-theme';
import { AVATAR_CONTAINER_STYLE, AVATAR_STYLE, BACKDROP_STYLE, BOX_CONTAINER_STYLE, DETAIL_CONTAINER_STYLE, LINK_STYLE } from './style';
import { COMMON_STYLE } from 'src/common/components/BPBetaTestWarning';

const MarketplaceList = () => (
  <div>
    <Alert
      severity='warning'
      sx={{
        ...COMMON_STYLE,
        position: 'fixed',
        top: '4rem',
        right: '1rem',
        height: '3rem',
        minWidth: '20rem',
      }}
    >
      En construction 🚧 Bientôt, nous vous proposerons de nouveaux clients 👥 ici !
    </Alert>
    <List sort={{ field: 'name', order: 'ASC' }} perPage={20} pagination={false} component={ListComponent} actions={false} sx={{ mb: 3 }}>
      <Marketplace />
    </List>
  </div>
);

const Marketplace = () => {
  const [expandedDescIndex, setExpandedDescIndex] = useState(null);

  const handleShowMore = selectedIndex => {
    setExpandedDescIndex(prevIndex => (prevIndex === selectedIndex ? null : selectedIndex));
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
                  <Box sx={BACKDROP_STYLE[1]}></Box>

                  <Box sx={AVATAR_CONTAINER_STYLE}>
                    <Avatar sx={AVATAR_STYLE} src={logoUrl} imgProps={{ sx: { objectFit: 'contain', backgroundColor: 'white' } }}>
                      <Storefront />
                    </Avatar>

                    <Typography variant='body1' component='b' sx={{ fontWeight: '600', pb: 1, mt: 0.5 }}>
                      {name}
                    </Typography>
                  </Box>

                  <Box sx={{ ...DETAIL_CONTAINER_STYLE, borderBottom: `1px solid ${BP_COLOR['solid_grey']}`, mt: 2.5 }}>
                    <Typography variant='caption'>
                      Site web :{' '}
                      <Link data-testid={`link-${websiteUrl}`} href={websiteUrl} target='_blank' rel='noreferrer' sx={LINK_STYLE}>
                        {name}
                      </Link>
                    </Typography>
                  </Box>

                  <Box onClick={() => handleShowMore(index)} sx={{ paddingBlock: 2 }} data-cy-item={`mp-${index}`}>
                    <Typography variant='body2' component='p' sx={{ cursor: expandedDescIndex === index ? 'text' : 'pointer' }}>
                      {description.slice(0, 20)}
                      {expandedDescIndex === index ? description.slice(20) : <code title='lire la suite'>...</code>}
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
