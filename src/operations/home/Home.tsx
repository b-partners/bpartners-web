import { BpAutoCompleteBackend, BPButton } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { Add, Inbox as InboxIcon } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, IconButton, Typography } from '@mui/material';
import { useGetList, useNotify } from 'react-admin';
import imageAnalyse from '/home/home-banner.webp';

import { useDialog } from '@/common/store/dialog';
import { stringCutter } from '@/common/utils';
import { annotatorProvider } from '@/providers';
import { FormEvent } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { GetImageDialog } from './get-image-dialog';
import { HomeStyle } from './style';

const AddressInput = () => {
  const form = useForm<{ address: string }>();
  const { open } = useDialog();
  const handleCreate = () => open(<GetImageDialog address={form.watch('address')} />, {}, false);
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleCreate();
  };

  return (
    <Box className='address-box'>
      <FormProvider {...form}>
        <Box component='form' onSubmit={handleSubmit} flexGrow={1}>
          <BpAutoCompleteBackend
            name='address'
            label='Adresse'
            fetcher={annotatorProvider.searchAddress}
            textFieldProps={{
              variant: 'outlined',
              InputProps: { startAdornment: <PublicIcon /> },
              ['data-cy' as any]: 'add-address',
            }}
            fullWidth
          />
        </Box>
      </FormProvider>
      <BPButton
        className='btn-analyse'
        onClick={handleCreate}
        label='resources.annotations.action.passToAnalyse'
        data-cy='button-analyze'
        data-path='/prospects'
      />
    </Box>
  );
};

export const Home = () => {
  const { data: prospectsList = [], isLoading } = useGetList('prospects', {
    pagination: { page: 1, perPage: 6 },
    filter: { status: 'TO_CONTACT' },
  });

  const notify = useNotify();

  const copyToClipboard = (text: string) => () => {
    navigator.clipboard.writeText(text).then(() => {
      notify('notify.adressCopySuccess', { type: 'info' });
    });
  };

  return (
    <>
      <Box component='section' sx={HomeStyle}>
        <Typography className='title'>Bienvenue sur le dashboard de Birdia</Typography>
        <Box className='main-container'>
          <Box className='image-container'>
            <img src={imageAnalyse} alt='Image de la maison' />
          </Box>
          <AddressInput />
          <Grid container spacing={3} maxHeight={'400px'}>
            <Grid item xs={12} md={6} height={'400px'}>
              <Card className='left-box' elevation={2}>
                <CardHeader title='Dernières notifications'></CardHeader>
                <CardContent>
                  <Grid container spacing={3} justifyContent='center' minHeight={200}>
                    {isLoading && (
                      <Box
                        display='flex'
                        color='#00000050'
                        marginTop='2rem'
                        height={200}
                        width='100%'
                        alignItems='center'
                        justifyContent='center'
                        flexDirection='column'
                      >
                        <CircularProgress size={30} />
                      </Box>
                    )}
                    {!isLoading && prospectsList.length === 0 && (
                      <Box display='flex' color='#00000050' marginTop='2rem' width='100%' height={200} alignItems='center' flexDirection='column'>
                        <div>
                          <InboxIcon sx={{ fontSize: '6rem' }} />
                        </div>
                        <Typography width={200} textAlign='center'>
                          Aucune annotation n'a encore été effectuée.
                        </Typography>
                      </Box>
                    )}
                    {!isLoading &&
                      prospectsList.map((prospect, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box className='prospect-item'>
                            <PublicIcon sx={{ mr: 1 }} />
                            <Box className='prospect-text'>
                              <Typography className='prospect-name' fontWeight='bold'>
                                {prospect.name || 'Nom non défini'}
                              </Typography>
                              <Typography className='prospect-address' onClick={copyToClipboard(prospect.address)} variant='body2'>
                                {stringCutter(prospect.address, 40)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} minHeight={'400px'}>
              <Grid item xs={12} minHeight={'100px'}>
                <Box className='block-box block-white' mb={2}>
                  <IconButton
                    style={{ color: PALETTE_COLORS.black }}
                    onClick={() => (window.location.pathname = '/prospects')}
                    data-cy='title-prospects'
                    data-path='/prospects'
                  >
                    <Typography className='block-title' fontWeight='bold' fontSize='1.5rem'>
                      Prospects
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem className='divider-black' />
                  <IconButton
                    style={{ color: PALETTE_COLORS.black }}
                    onClick={() => (window.location.pathname = '/prospects')}
                    data-cy='add-prospects'
                    data-path='/prospects'
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              <Grid container spacing={2} minHeight={'100px'}>
                <Grid item xs={6}>
                  <Box className='block-box block-orange'>
                    <IconButton
                      style={{ color: PALETTE_COLORS.white }}
                      onClick={() => (window.location.href = '/customers')}
                      data-cy='title-customers'
                      data-path='/customers'
                    >
                      <Typography className='block-title' fontWeight='bold' fontSize='1.5rem'>
                        Clients
                      </Typography>
                    </IconButton>
                    <Divider orientation='vertical' flexItem className='divider-white' />
                    <IconButton
                      style={{ color: PALETTE_COLORS.white }}
                      onClick={() => (window.location.pathname = '/customers/create')}
                      data-cy='add-customers'
                      data-path='/customers/create'
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box className='block-box block-pine'>
                    <IconButton
                      style={{ color: PALETTE_COLORS.white }}
                      onClick={() => (window.location.href = '/products')}
                      data-cy='title-products'
                      data-path='/products'
                    >
                      <Typography className='block-title' fontWeight='bold' fontSize='1.5rem'>
                        Produits
                      </Typography>
                    </IconButton>
                    <Divider orientation='vertical' flexItem className='divider-white' />
                    <IconButton
                      style={{ color: PALETTE_COLORS.white }}
                      onClick={() => (window.location.pathname = '/products/create')}
                      data-cy='add-products'
                      data-path='/products/create'
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box className='block-box block-forest'>
                    <IconButton
                      style={{ color: PALETTE_COLORS.white }}
                      onClick={() => (window.location.href = '/invoices')}
                      data-cy='title-invoices-1'
                      data-path='/invoices'
                    >
                      <Typography className='block-title' fontWeight='bold' fontSize='1.5rem'>
                        Devis
                      </Typography>
                    </IconButton>
                    <Divider orientation='vertical' flexItem className='divider-white' />
                    <IconButton
                      style={{ color: PALETTE_COLORS.white }}
                      onClick={() => (window.location.pathname = '/invoices?showCreateQuote=true')}
                      data-cy='add-invoices-1'
                      data-path='/invoices?showCreateQuote=true'
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box className='block-box block-white'>
                    <IconButton
                      style={{ color: PALETTE_COLORS.black }}
                      onClick={() => (window.location.href = '/invoices')}
                      data-cy='title-invoices-2'
                      data-path='/invoices'
                    >
                      <Typography className='block-title' fontWeight='bold' fontSize='1.5rem'>
                        Factures
                      </Typography>
                    </IconButton>
                    <Divider orientation='vertical' flexItem className='divider-white' />
                    <IconButton
                      style={{ color: PALETTE_COLORS.black }}
                      onClick={() => (window.location.pathname = '/invoices?showCreateQuote=true')}
                      data-cy='add-invoices-2'
                      data-path='/invoices?showCreateQuote=true'
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};
