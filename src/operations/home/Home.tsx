import { BPButton } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { Add } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, Divider, Grid, IconButton, TextField, Typography } from '@mui/material';
import { useGetList, useRecordContext } from 'react-admin';

export const Home = () => {
  const record = useRecordContext();
  const { data: prospectsList = [] } = useGetList('prospects', { pagination: { page: 1, perPage: 6 } });
  console.log(record);
  return (
    <Box>
      <Typography sx={{ fontSize: '2rem', textAlign: 'center', color: PALETTE_COLORS.neon_orange, fontWeight: 'bold', bgcolor: PALETTE_COLORS.white }}>
        Bienvenue sur le dashboard de Birdia
      </Typography>
      <Box p={3} bgcolor={PALETTE_COLORS.white} minHeight='100vh'>
        {/* ✅ Image bien cadrée et limitée */}
        <Box
          sx={{
            width: '100%',
            maxHeight: '420px',
            minHeight: '370px',
            overflow: 'hidden',
            borderRadius: 3,
            mb: 2,
          }}
        >
          <img
            src='/Account/Photo-Home-Page.jpg'
            alt='Logo'
            style={{
              width: '100%',
              height: '500px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>

        {/* Adresse en haut */}
        <Box sx={{ display: 'flex', mt: -0.3 }}>
          <TextField
            fullWidth
            variant='outlined'
            label={
              <>
                <PublicIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                adresse :
              </>
            }
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': {
                  borderColor: PALETTE_COLORS.black, // couleur par défaut
                },
                '&:hover fieldset': {
                  borderColor: PALETTE_COLORS.neon_orange, // couleur au survol
                },
                '&.Mui-focused fieldset': {
                  borderColor: PALETTE_COLORS.neon_orange, // couleur quand le champ est sélectionné
                },
              },
            }}
          />
          <BPButton
            sx={{ fontSize: '1rem', color: PALETTE_COLORS.white, height: '40px', borderRadius: 3, ml: 1, textAlign: 'center', mt: -0.1 }}
            onClick={() => (window.location.pathname = '/prospects')}
            label="Passer à l'analyse"
          />
        </Box>

        {/* Grille principale */}
        <Grid container spacing={3} maxHeight={'400px'}>
          {/* Bloc gauche avec .map() */}
          <Grid item xs={12} md={6} height={'400px'}>
            <Box
              sx={{
                boxShadow: '0 2px 6px #949494ff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                p: 5,
                borderRadius: 2,
                bgcolor: PALETTE_COLORS.white,
                mr: -0.5,
                height: '76%',
              }}
            >
              <Grid container spacing={3} justifyContent='center'>
                {prospectsList.map((prospect, index) => (
                  <Grid item xs={12} sm={6} key={index} minHeight={'76px'}>
                    <Box
                      display='flex'
                      alignItems='center'
                      sx={{
                        maxWidth: 300, // largeur max d'une box pour contrôler la taille
                        margin: '0 auto', // centre chaque box individuellement
                      }}
                    >
                      <PublicIcon sx={{ mr: 1 }} />
                      <Box textAlign='left' width={'95%'}>
                        <Typography fontWeight='bold'>{prospect.name}</Typography>
                        <Typography variant='body2' sx={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prospect.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Bloc droite avec 4 blocs */}
          <Grid item xs={12} md={6} minHeight={'400px'}>
            <Grid item xs={12} minHeight={'100px'}>
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                p={2}
                mb={2}
                borderRadius={2}
                style={{
                  backgroundColor: PALETTE_COLORS.white,
                  color: PALETTE_COLORS.black,
                  boxShadow: '0 2px 6px #949494ff',
                }}
              >
                <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.pathname = '/prospects')}>
                  <Typography fontWeight='bold' fontSize='1.5rem'>
                    Prospects
                  </Typography>
                </IconButton>
                <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.black, margin: '0 12px' }} />
                <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.pathname = '/prospects')}>
                  <Add />
                </IconButton>
              </Box>
            </Grid>

            <Grid container spacing={2} minHeight={'100px'}>
              {/* Clients */}
              <Grid item xs={6}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  sx={{
                    backgroundColor: PALETTE_COLORS.neon_orange,
                    color: PALETTE_COLORS.white,
                    boxShadow: '0 2px 6px #949494ff',
                  }}
                >
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/customers')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Clients
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/customers/create')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              {/* Produits */}
              <Grid item xs={6} minHeight={'100px'}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  style={{
                    backgroundColor: PALETTE_COLORS.pine,
                    color: PALETTE_COLORS.white,
                    boxShadow: '0 2px 6px #949494ff',
                  }}
                >
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/products')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Produits
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/products/create')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              {/* Devis */}
              <Grid item xs={6} minHeight={'100px'}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  style={{
                    backgroundColor: PALETTE_COLORS.forest,
                    color: PALETTE_COLORS.white,
                    boxShadow: '0 2px 6px #949494ff',
                  }}
                >
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/invoices')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Devis
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/invoices?showCreateQuote=true')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              {/* Factures */}
              <Grid item xs={6} minHeight={'100px'}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  style={{
                    backgroundColor: PALETTE_COLORS.white,
                    color: PALETTE_COLORS.black,
                    boxShadow: '0 2px 6px #949494ff',
                  }}
                >
                  <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.href = '/invoices')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Factures
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
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
