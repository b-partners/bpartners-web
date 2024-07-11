import { SxProps, Theme } from '@mui/material';
import { BP_COLOR } from '@/bp-theme';

export const LAYOUT: SxProps<Theme> = {
  width: '99%',
  height: '100%',
  padding: 2,
  display: 'flex',
  flexWrap: 'wrap',
};

export const TEXT_MESSAGE: SxProps<Theme> = {
  fontWeight: 'bold',
  marginBottom: 10,
};

export const BANK_CARD: SxProps<Theme> = {
  position: 'relative',
  width: 440,
  height: 300,
  paddingLeft: 5,
  borderRadius: 3,
  background: 'rgb(0, 0, 0, 0.03)',
  outline: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
};

export const NO_BANK_CARD: SxProps<Theme> = {
  ...BANK_CARD,
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: 0,
  width: 450,
};

export const BANK_INFORMATION_CONTAINER: SxProps<Theme> = { display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: 630 };
export const BIC_MESSAGE_CONTAINER: SxProps<Theme> = {
  width: 300,
  marginBottom: 1,
  paddingY: 0.5,
  background: 'rgb(0, 0, 0, 0.03)',
  outline: 'none',
  border: 'none',
  borderRadius: 2,
};

export const USER_CARD = {
  ...BANK_CARD,
  background: '#fff !important',
  boxShadow: 'none',
};

export const BANK_LOGO = {
  position: 'absolute',
  top: '1.5rem',
  right: 0,
  borderRadius: '0.5rem',
  height: '4rem',
};

export const CARD_CONTENT = { display: 'flex', justifyContent: 'space-around' };

export const DISCONNECT_BANK_LOGO = {
  position: 'absolute',
  bottom: '1rem',
  top: 'none',
  right: '2rem',
  '.MuiSvgIcon-root': {
    fontSize: '2.5rem',
  },
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
  color: BP_COLOR['solid_grey'],
  fontSize: '20rem',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

export const HERE_LINK = { textDecorationLine: 'underline', cursor: 'pointer', fontWeight: 'bold', color: BP_COLOR[10] };
