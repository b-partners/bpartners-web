import { Avatar, Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { AccountStyle } from './style';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { PALETTE_COLORS } from '@/common/config/theme';

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
        top: 0,
        left: 0,
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
  { label: 'Siren', helperText: 'Micro-entreprise exonérée de TVA' },
  { label: 'Ville' },
  { label: 'Pays' },
  { label: 'Adresse' },
];

export const Account = () => {
    return (
        <Box component='section' id='section-account' sx={AccountStyle}>
            <Box id='container'>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card className='card card-user'>
                            <CardContent>
                                <Box className='user-header'>
                                    <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
                                        <Avatar className='avatar' alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                                    </StyledBadge>
                                    <Box className='container-typo-user' >
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
                                <Typography sx={{fontStyle: 'italic', mb:3 }}>Vous bénéficiez actuellement d’une période d’essai gratuite.</Typography>
                                <Typography sx={{ mt:1, fontWeight: 'bold'}} mt={1}>Début de la période d’essai : 26/06/2025</Typography>
                                <Typography sx={{ mt:1, fontWeight: 'bold'}}>Fin de la période d’essai : 10/07/2025</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card className='card company-card'>
                            <CardContent>
                                <Typography className='section-title'>Ma société</Typography>
                                <Grid container spacing={2}>
                                    {companyFields.map((field, index) => (
                                        <Grid item xs={12} sm={4} key={index}>
                                            <TextField fullWidth label={field.label} defaultValue={field.defaultValue || ''} helperText={field.helperText || ''} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};
