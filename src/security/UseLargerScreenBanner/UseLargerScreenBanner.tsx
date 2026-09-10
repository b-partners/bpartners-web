import { Box, Typography } from '@mui/material';
import { UseLargerScreenBannerStyle } from './style';

export const UseLargerScreenBanner = () => (
  <Box sx={UseLargerScreenBannerStyle}>
    <Typography component='h1' className='banner-title'>
      Profitez pleinement de BIRDIA
    </Typography>
    <Typography className='banner-text'>
      Toute la puissance de l'application se déploie sur un plus grand écran. Retrouvez-nous sur votre ordinateur pour piloter votre activité en toute sérénité.
    </Typography>
  </Box>
);
