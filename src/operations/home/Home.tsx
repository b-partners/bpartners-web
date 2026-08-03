import { BpAutoCompleteBackend, BPButton } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { useSirenRequirement } from '@/common/hooks';
import { Add, Inbox as InboxIcon } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, IconButton, List, Paper, Typography } from '@mui/material';
import { useGetList } from 'react-admin';
import imageAnalyse from '/home/home-banner.webp';

import { useDialog } from '@/common/store/dialog';
import { annotatorProvider } from '@/providers';
import { FormEvent } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { GetImageDialog } from './get-image-dialog';
import { ProjectListItem } from './project-list-item';
import { HomeStyle } from './style';

const AddressInput = () => {
  const form = useForm<{ address: string }>();
  const { open } = useDialog();
  const { requireSiren } = useSirenRequirement();
  const handleCreate = () => {
    if (!requireSiren(handleCreate)) return;
    open(<GetImageDialog address={form.watch('address')} />, {}, false);
  };
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
  const { data: draftAnnotations = [], isLoading } = useGetList('drafts-annotations', {
    pagination: { page: 1, perPage: 6 },
    filter: { status: 'TO_CONTACT' },
  });

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
            <Grid item xs={12} md={8}>
              <Card className='left-box'>
                <CardHeader title='Dernières notifications'></CardHeader>
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                      <List>{!isLoading && draftAnnotations.slice(0, 3).map(dA => <ProjectListItem draftAnnotation={dA} key={dA.id} />)}</List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List>{!isLoading && draftAnnotations.slice(3).map(dA => <ProjectListItem draftAnnotation={dA} key={dA.id} />)}</List>
                    </Grid>
                  </Grid>
                  {!isLoading && draftAnnotations.length === 0 && (
                    <Grid container spacing={3} justifyContent='center' minHeight={200}>
                      <Box display='flex' color='#00000050' marginTop='2rem' width='100%' height={200} alignItems='center' flexDirection='column'>
                        <div>
                          <InboxIcon sx={{ fontSize: '6rem' }} />
                        </div>
                        <Typography width={200} textAlign='center'>
                          Aucune annotation n'a encore été effectuée.
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {isLoading && (
                    <Grid container spacing={3} justifyContent='center' minHeight={200}>
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
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4} minHeight={'400px'}>
              <Grid item xs={12} minHeight={'100px'}>
                <Paper className='block-box block-white' mb={2}>
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
                </Paper>
              </Grid>
              <Grid container spacing={2} minHeight={'100px'}>
                <Grid item xs={6}>
                  <Paper className='block-box block-orange'>
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
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper className='block-box block-pine'>
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
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper className='block-box block-forest'>
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
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper className='block-box block-white'>
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
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};
