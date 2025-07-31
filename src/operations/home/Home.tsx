import { BPButton } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { Add } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, Divider, Grid, IconButton, TextField, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';

const prospectsList = [
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
];

export const Home = () => {
  const record = useRecordContext();
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
            maxHeight: '450px',
            minHeight: '450px',
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
        <Box sx={{ display: 'flex' }}>
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
        <Grid container spacing={3}>
          {/* Bloc gauche avec .map() */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                boxShadow: '0 2px 6px #000000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                p: 5,
                borderRadius: 2,
                bgcolor: PALETTE_COLORS.white,
              }}
            >
              <Grid container spacing={3}>
                {prospectsList.map((prospect, index) => (
                  <Grid item xs={12} sm={6} key={index} minHeight={'76px'}>
                    <Box display='flex' alignItems='center' justifyContent={'center'}>
                      <PublicIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography fontWeight='bold'>{prospect.name}</Typography>
                        <Typography variant='body2'>{prospect.address}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Bloc droite avec 4 blocs */}
          <Grid item xs={12} md={6}>
            <Grid item xs={12}>
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
                  boxShadow: '0 2px 6px #000000',
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

            <Grid container spacing={2}>
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
                    boxShadow: '0 2px 6px #000000',
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
              <Grid item xs={6}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  style={{
                    backgroundColor: PALETTE_COLORS.pine,
                    color: PALETTE_COLORS.white,
                    boxShadow: '0 2px 6px #000000',
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
              <Grid item xs={6}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  style={{
                    backgroundColor: PALETTE_COLORS.forest,
                    color: PALETTE_COLORS.white,
                    boxShadow: '0 2px 6px #000000',
                  }}
                >
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.href = '/invoices')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Devis
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                  <IconButton style={{ color: PALETTE_COLORS.white }} onClick={() => (window.location.pathname = '/invoices')}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              {/* Factures */}
              <Grid item xs={6}>
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  borderRadius={2}
                  style={{
                    backgroundColor: PALETTE_COLORS.white,
                    color: PALETTE_COLORS.black,
                    boxShadow: '0 2px 6px #000000',
                  }}
                >
                  <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.href = '/invoices')}>
                    <Typography fontWeight='bold' fontSize='1.5rem'>
                      Factures
                    </Typography>
                  </IconButton>
                  <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                  <IconButton style={{ color: PALETTE_COLORS.black }} onClick={() => (window.location.pathname = '/invoices')}>
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
