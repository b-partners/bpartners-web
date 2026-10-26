import { SxProps, Theme } from '@mui/material';
import { CSSProperties } from 'react';

export const LOGO: CSSProperties = {
  position: 'absolute',
  bottom: 20,
  right: 20,
  maxWidth: '150px',
  maxHeight: '150px',
  objectFit: 'contain',
};

export const P_CARD: SxProps<Theme> = {
  padding: 1,
  position: 'relative',
  width: 400,
  height: 350,
  background: 'rgb(58,80,133)',
  outline: 'none',
  border: 'none',
  overflow: 'hidden',
  margin: 2,
  borderTopLeftRadius: '0px',
};

export const P_CORNER: SxProps<Theme> = {
  position: 'absolute',
  height: '40px',
  width: '40px',
  background: 'white',
};
export const CONTAINER: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  position: 'relative',
};

export const P_CARD_TEXT_HEADER_CONTAINER: SxProps<Theme> = {
  width: '96%',
  marginLeft: '1rem',
  marginTop: '1rem',
  textAlign: 'start',
  height: '30%',
};
export const P_CARD_TEXT_BODY_CONTAINER: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '20%',
  marginBottom: '1rem',
  width: '100%',
};

export const P_CARD_TEXT_HEADER: SxProps<Theme> = {
  width: 'fit-content',
  fontSize: '1.2rem',
  maxWidth: '70%',
  fontWeight: 'bold',
  textTransform: 'upper',
};
export const P_CARD_TEXT_BODY: SxProps<Theme> = {
  color: 'white',
  marginLeft: '0.5rem',
  maxWidth: '70%',
  textAlign: 'center',
};
export const P_CARD_BUTTON_CONTAINER: SxProps<Theme> = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
export const P_CARD_BUTTON: SxProps<Theme> = {
  background: '#0091DB',
  paddingInline: '1rem',
  textTransform: 'none',
  '&:hover': {
    background: '#1d6bA5',
  },
};
