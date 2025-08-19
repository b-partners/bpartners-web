import { BPButton } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { Add } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, CircularProgress, Divider, Grid, IconButton, TextField, Typography } from '@mui/material';
import { useGetList } from 'react-admin';
import imageAnalyse from '/home/home-banner.webp';

import { useToggle } from '@/common/hooks';
import { handleSubmit } from '@/common/utils';
import { BaseSyntheticEvent, FC, useState } from 'react';
import { ProspectFormDialog } from '../prospects/components';
import { ProspectDialogProvider } from '../prospects/ProspectsList';
import { HomeStyle } from './style';

// ... imports identiques

const AddressInput = () => {
  const [address, setAddress] = useState('');
  return (
    <Box className='address-box'>
      <TextField
        fullWidth
        variant='outlined'
        data-cy='add-address'
        label={
          <>
            <PublicIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            adresse :
          </>
        }
        className='address-field'
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      <ProspectDialogProvider
        address={address}
        ComponentChild={({ saveOrUpdateProspectSubmit }: Pick<CreateProspectDialogProps, 'saveOrUpdateProspectSubmit'>) => (
          <CreateProspectDialog saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit} />
        )}
      />
    </Box>
  );
};

export const Home = () => {
  const { data: prospectsList = [], isLoading } = useGetList('prospects', {
    pagination: { page: 1, perPage: 6 },
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
            <Grid item xs={12} md={6} height={'400px'}>
              <Box className='left-box'>
                <Grid container spacing={3} justifyContent='center'>
                  {isLoading && <CircularProgress size={50} />}
                  {!isLoading &&
                    prospectsList.map((prospect, index) => (
                      <Grid item xs={12} sm={6} key={index} minHeight={'76px'}>
                        <Box className='prospect-item'>
                          <PublicIcon sx={{ mr: 1 }} />
                          <Box className='prospect-text'>
                            <Typography className='prospect-name' fontWeight='bold'>
                              {prospect.name}
                            </Typography>
                            <Typography className='prospect-address' variant='body2'>
                              {prospect.address}
                            </Typography>
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

type CreateProspectDialogProps = {
  saveOrUpdateProspectSubmit: (toggleDialog: () => void, isCreating: boolean, e: BaseSyntheticEvent) => Promise<void>;
};
const CreateProspectDialog: FC<CreateProspectDialogProps> = ({ saveOrUpdateProspectSubmit }) => {
  const { value: isCreating, toggleValue: toggleCreating } = useToggle();

  const saveOrUpdateProspect = (event: BaseSyntheticEvent) => saveOrUpdateProspectSubmit(toggleCreating, isCreating, event);

  return (
    <>
      <BPButton className='btn-analyse' onClick={toggleCreating} label="Passer à l'analyse" data-cy='button-analyze' data-path='/prospects' />
      {isCreating && (
        <form onSubmit={handleSubmit(saveOrUpdateProspect)} style={{ display: 'flex', flexDirection: 'column' }}>
          <ProspectFormDialog open={isCreating} close={toggleCreating} saveOrUpdateProspectSubmit={saveOrUpdateProspect} isCreating={isCreating} />
        </form>
      )}
    </>
  );
};
