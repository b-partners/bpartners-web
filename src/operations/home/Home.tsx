import { BPButton } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { Add } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, Divider, Grid, IconButton, TextField, Typography } from '@mui/material';
import { useGetList, useRecordContext } from 'react-admin';

import { HomeStyle } from './style';

export const Home = () => {
  const record = useRecordContext();
  const { data: prospectsList = [] } = useGetList('prospects', {
    pagination: { page: 1, perPage: 6 },
  });

  console.log(record);

  return (
    <Box component='section' sx={HomeStyle}>
      <Typography className='title'>Bienvenue sur le dashboard de Birdia</Typography>
      <Box className='main-container'>
        <Box className='image-container'>
          <img src='/Account/Photo-Home-Page.jpg' alt='Logo' />
        </Box>
        <Box className='address-box'>
          <TextField
            fullWidth
            variant='outlined'
            label={
              <>
                <PublicIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                adresse :
              </>
            }
            className='address-field'
          />
          <BPButton className='btn-analyse' onClick={() => (window.location.pathname = '/prospects')} label="Passer à l'analyse" />
        </Box>
        <Grid container spacing={3} maxHeight={'400px'}>
          <Grid item xs={12} md={6} height={'400px'}>
            <Box className='left-box'>
              <Grid container spacing={3} justifyContent='center'>
                {prospectsList.map((prospect, index) => (
                  <Grid item xs={12} sm={6} key={index} minHeight={'76px'}>
                    <Box className='prospect-item'>
                      <PublicIcon sx={{ mr: 1 }} />
                      <Box className='prospect-text'>
                        <Typography fontWeight='bold'>{prospect.name}</Typography>
                        <Typography variant='body2'>{prospect.address}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} minHeight={'400px'}>
            <Grid item xs={12} minHeight={'100px'}>
              <Box className='block-box block-white' mb={2}>
                <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.pathname = '/prospects')}>
                  <Typography fontWeight='bold' fontSize='1.5rem'>
                    Prospects
                  </Typography>
                </IconButton>
                <Divider orientation='vertical' flexItem className='divider-black' />
                <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.pathname = '/prospects')}>
                  <Add />
                </IconButton>
              </Box>
            </Grid>
            <Grid container spacing={2} minHeight={'100px'}>
              <Grid item xs={6}>
                <Box className='block-box block-orange'>
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/customers')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Clients
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem className='divider-white' />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/customers/create')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className='block-box block-pine'>
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/products')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Produits
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem className='divider-white' />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/products/create')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className='block-box block-forest'>
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/invoices')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Devis
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem className='divider-white' />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/invoices?showCreateQuote=true')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className='block-box block-white'>
                  <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.href = '/invoices')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Factures
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem className='divider-white' />
                  <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.pathname = '/invoices?showCreateQuote=true')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
