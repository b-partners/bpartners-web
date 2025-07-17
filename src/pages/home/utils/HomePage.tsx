import { PALETTE_COLORS } from '@/common/config/theme';
import { Add } from '@mui/icons-material';
import PublicIcon from '@mui/icons-material/Public';
import { Box, Divider, Grid, IconButton, Typography } from '@mui/material';

const prospectsList = [
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
  { name: 'Jean Dupont', address: '14 avenue d’Italie, Paris 75020' },
];

export const HomePage = () => {
  return (
    <Box p={3} bgcolor={PALETTE_COLORS.white} minHeight='100vh'>
      {/* ✅ Image bien cadrée et limitée */}
      <Box
        sx={{
          width: '100%',
          maxHeight: '400px',
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
            height: 'auto',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </Box>

      {/* Adresse en haut */}
      <Typography variant='body2' fontWeight={600} mb={2}>
        <PublicIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Adresse :{' '}
        <Typography component='span' fontWeight='bold'>
          8 rue Puget, Paris 75020
        </Typography>
      </Typography>

      {/* Grille principale */}
      <Grid container spacing={3}>
        {/* Bloc gauche avec .map() */}
        <Grid item xs={12} md={6}>
          <Box
            bgcolor={PALETTE_COLORS.white}
            borderRadius={2}
            p={0.6}
            sx={{ boxShadow: '0 2px 6px #000000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
          >
            {prospectsList.map((prospect, index) => (
              <Box key={index} display='flex' alignItems='center' mb={2}>
                <PublicIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography fontWeight='bold'>{prospect.name}</Typography>
                  <Typography variant='body2'>{prospect.address}</Typography>
                </Box>
              </Box>
            ))}
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
              <IconButton style={{ color: PALETTE_COLORS.black }}>
                <Typography fontWeight='bold'>Prospects</Typography>
              </IconButton>
              <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.black, margin: '0 12px' }} />
              <IconButton style={{ color: PALETTE_COLORS.black }}>
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
                style={{
                  backgroundColor: PALETTE_COLORS.neon_orange,
                  color: PALETTE_COLORS.white,
                  boxShadow: '0 2px 6px #000000',
                }}
              >
                <IconButton style={{ color: PALETTE_COLORS.white }}>
                  <Typography fontWeight='bold'>Clients</Typography>
                </IconButton>
                <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                <IconButton style={{ color: PALETTE_COLORS.white }}>
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
                <IconButton style={{ color: PALETTE_COLORS.white }}>
                  <Typography fontWeight='bold'>Produits</Typography>
                </IconButton>
                <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                <IconButton style={{ color: PALETTE_COLORS.white }}>
                  <Add />
                </IconButton>
              </Box>
            </Grid>

            {/* Devis / Factures */}
            <Grid item xs={12}>
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
                <IconButton style={{ color: PALETTE_COLORS.white }}>
                  <Typography fontWeight='bold'>Devis / Factures</Typography>
                </IconButton>
                <Divider orientation='vertical' flexItem style={{ backgroundColor: PALETTE_COLORS.white, margin: '0 12px' }} />
                <IconButton style={{ color: PALETTE_COLORS.white }}>
                  <Add />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
