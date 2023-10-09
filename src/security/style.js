import { pink, grey } from '@mui/material/colors';
import { BP_COLOR } from 'src/bp-theme';

export const lightGreyColor = grey[100];
export const darkGreyColor = grey[800];
export const pinkColor = pink[50];
export const whiteColor = '#ffffff';

export const FLEX_CENTER = {
  display: 'flex',
  justifyContent: 'center',
  bgcolor: lightGreyColor,
  height: '100vh',
  alignItems: 'center',
  overflow: 'hidden',
};

export const LOGIN_FORM = { display: 'flex', flexDirection: 'column', bgcolor: lightGreyColor, minWidth: '30vh' };
export const LOGIN_FORM_BUTTON = {
  textTransform: 'none',
  bgcolor: 'rgba(156, 37, 90, 1)',
  color: whiteColor,
  width: '300px',
  '&:hover': {
    background: BP_COLOR[5],
    opacity: 1,
  },
  '&:disabled': {
    background: darkGreyColor,
    color: whiteColor,
  },
};

export const TRANSPARENT_BUTTON_STYLE = {
  backgroundColor: 'transparent',
  color: '#000000',
  textTransform: 'none',
  textAlign: 'left',
  p: 0,
  '&:hover': {
    backgroundColor: 'transparent',
    textDecoration: 'underline',
    color: BP_COLOR[20],
  },
};

export const BP_B_LOGO = { width: 100, position: 'absolute', top: '3%', left: '3%' };
export const REDIRECTION_MESSAGE = {
  position: 'absolute',
  bottom: '6.5rem',
  left: '50%',
  opacity: '0.5',
  transform: 'translateX(-50%)',
  color: '#F5F5F5',
  display: 'flex',
};
