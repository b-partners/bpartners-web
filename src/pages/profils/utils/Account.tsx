import { PALETTE_COLORS } from '@/common/config/theme';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Avatar, Box, Card, CardContent, Checkbox, Grid, TextField, Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { AccountStyle } from '../style';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: PALETTE_COLORS.pine,
    color: PALETTE_COLORS.pine,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    borderRadius: '100%',
    width: '20px',
    height: '20px',
    '&::after': {
      position: 'absolute',
      top: -1,
      left: -1,
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const companyFields = [
  { label: 'Raison sociale', defaultValue: 'Smart_IDF_Region' },
  { label: 'Encaissement annuelle à réaliser', defaultValue: 'Objectif non défini' },
  { label: 'Activité principale', defaultValue: 'Couvreur' },
  { label: 'Code postal' },
  { label: 'Activité secondaire' },
  { label: 'Code de la commune de prospection' },
  { label: 'Activité officielle' },
  { label: 'Numéro de TVA' },
  { label: 'Capital social', defaultValue: '0,00€' },
  { label: 'Site web' },
  { label: 'Siren', checkbox: true, defaultChecked: true, defaultValue: 'Micro-entreprise exonérée de TVA' },
  { label: 'Ville' },
  { label: 'Pays' },
  { label: 'Adresse' },
];

export const Account = () => {
  const [checkboxStates, setCheckboxStates] = useState(companyFields.map(field => field.defaultChecked || false));
  return (
    <Box component='section' id='section-account' sx={AccountStyle}>
      <Box id='container'>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card className='card card-user'>
              <CardContent>
                <Box className='user-header'>
                  <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant='dot'>
                    <Avatar className='avatar' src='/Account/Photo-birdia-demo.webp' alt='Photo de profil' />
                  </StyledBadge>
                  <Box className='container-typo-user'>
                    <Typography className='typo-user'>Nom prénom</Typography>
                    <Typography className='typo-user'>Adresse postale</Typography>
                    <Typography className='typo-user'>Adresse mail</Typography>
                    <Typography className='typo-user'>Numéro de téléphone</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className='card card-trial'>
              <CardContent>
                <Typography className='section-title'>Période d’essai</Typography>
                <Typography sx={{ fontStyle: 'italic', mb: 3 }}>Vous bénéficiez actuellement d’une période d’essai gratuite.</Typography>
                <Typography sx={{ mt: 1, fontWeight: 'bold' }}>Début de la période d’essai : 26/06/2025</Typography>
                <Typography sx={{ mt: 1, fontWeight: 'bold' }}>Fin de la période d’essai : 10/07/2025</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card className='card company-card'>
              <CardContent>
                <Typography className='section-title-company'>Ma société</Typography>
                <Grid container spacing={2}>
                  {companyFields.map((field, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      {field.checkbox ? (
                        <TextField
                          fullWidth
                          label={field.label}
                          defaultValue={field.defaultValue}
                          InputProps={{
                            endAdornment: (
                              <Checkbox
                                checked={checkboxStates[index]}
                                onChange={e => {
                                  const newStates = [...checkboxStates];
                                  newStates[index] = e.target.checked;
                                  setCheckboxStates(newStates);
                                }}
                                color='success'
                              />
                            ),
                          }}
                          variant='outlined'
                        />
                      ) : (
                        <TextField fullWidth label={field.label} defaultValue={field.defaultValue || 'A compléter'} />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card className='card subscription-card'>
              <CardContent>
                <Typography className='section-title-subscription'>Mon abonnement</Typography>
                <Typography className='price-subscription'>Pour 49 € par mois :</Typography>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li className='list-subscription'>
                    <ArrowRightRoundedIcon className='arrow-list' />
                    Activation de notre intelligence artificielle qui analyse les toitures de vos prospects et organise le suivi des toitures de vos clients
                    existants. 20 toitures incluses puis 2€ par toiture supplémentaire
                  </li>
                  <li className='list-subscription'>
                    <ArrowRightRoundedIcon className='arrow-list' />
                    Accès aux outils de devis/facturation personnalisé, gestion des acomptes, relance impayés CRM, gestion des produits, synchronisation
                    bancaire et suivi de trésorerie.
                  </li>
                  <li className='list-subscription'>
                    <ArrowRightRoundedIcon className='arrow-list' />
                    Initiez la collecte de vos encaissements instantanément par QR code, Mails ou SMS en 1 clic. Lien de paiement intégré à la facture pour
                    seulement 0,99%
                  </li>
                  <li className='list-subscription'>
                    <ArrowRightRoundedIcon className='arrow-list' />
                    Support 7/7
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
