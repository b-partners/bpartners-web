import { SxProps, Theme } from '@mui/material';

export const LOGO = {
  height: '3rem',
  position: 'absolute',
  top: 25,
  right: 25,
};

export const P_CARD: SxProps<Theme> = {
  padding: 1,
  position: 'relative',
  width: 420,
  height: 250,
  background: 'rgb(0, 0, 0, 0.03)',
  outline: 'none',
  border: 'none',
  overflow: 'hidden',
  margin: 2,
};

export const CARD_MESSAGE: SxProps<Theme> = {
  fontSize: '1.8rem',
  width: 240,
  margin: 2,
};

export const CARD_NAME: SxProps<Theme> = {
  position: 'absolute',
  bottom: 34,
  left: 25,
};
export const CARD_NAME_UNDERLINE: SxProps<Theme> = {
  width: 20,
  position: 'absolute',
  bottom: 24,
  left: 25,
  border: '1px solid #000',
};
export const CARD_CONTACT: SxProps<Theme> = {
  position: 'absolute',
  bottom: 10,
  right: 15,
};
export const CARD_CONTACT_STACK: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexDirection: 'row',
  height: 25,
};
export const LINK: SxProps<Theme> = {
  color: '#000',
  textDecoration: 'none',
  cursor: 'pointer',
  fontSize: '0.7rem',
};
export const CONTAINER: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  position: 'relative',
};
