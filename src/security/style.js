import { pink, grey } from '@mui/material/colors';

export const lightGreyColor = grey[100];
export const darkGreyColor = grey[800];
export const pinkColor = pink[50];
export const whiteColor = '#ffffff';

export const FLEX_CENTER = { display: 'flex', justifyContent: 'center', bgcolor: lightGreyColor, height: '100vh', alignItems: 'center', overflow: 'hidden' };

export const LOGIN_FORM = { display: 'flex', flexDirection: 'column', bgcolor: lightGreyColor, minWidth: '30vh' };
export const LOGIN_FORM_BUTTON = {
  textTransform: 'none',
  bgcolor: darkGreyColor,
  color: whiteColor,
  '&:hover': {
    background: darkGreyColor,
  },
};

export const BP_B_LOGO = { width: 60, position: 'absolute', top: '3%', left: '3%' };
