import { SxProps, Theme } from '@mui/material';
import { BP_COLOR } from 'src/bp-theme';

export const LAYOUT: SxProps<Theme> = {
  width: '99%',
  height: '100%',
  padding: 2,
  display: 'flex',
  flexWrap: 'wrap',
};

export const BANK_CARD: SxProps<Theme> = {
  position: 'relative',
  width: 500,
  height: 250,
  borderRadius: 3,
  padding: 10,
  paddingTop: 5,
  paddingLeft: 5,
  background: 'rgb(0, 0, 0, 0.03)',
  outline: 'none',
  border: 'none',
};

export const BANK_INFORMATION_CONTAINER: SxProps<Theme> = { display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: 630 };
export const BIC_MESSAGE_CONTAINER: SxProps<Theme> = { width: 300, marginBlock: 1, background: 'rgb(0, 0, 0, 0.03)', outline: 'none', border: 'none' };

export const USER_CARD = {
  ...BANK_CARD,
  background: '#fff !important',
  boxShadow: 'none',
};

export const BANK_LOGO = {
  position: 'absolute',
  top: '1.5rem',
  right: '-1rem',
  borderRadius: '0.5rem',
  height: '6rem',
};

export const NO_BANK_LAYOUT: SxProps<Theme> = {
  ...LAYOUT,
  justifyContent: 'center',
  alignItems: 'center',
};

export const EMPTY_LIST_STYLE = {
  border: 'none',
  p: 4,
  bg: BP_COLOR[40],
  '& .MuiAlert-icon': {
    color: BP_COLOR[20],
  },
};

export const BALANCE_ICON = {
  color: BP_COLOR.solid_grey,
  fontSize: '20rem',
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: -1,
};

export const HERE_LINK = { textDecorationLine: 'underline', cursor: 'pointer', fontWeight: 'bold', color: BP_COLOR[10] };
