import { BP_COLOR } from '@/bp-theme';
import { SxProps, Theme } from '@mui/material';
import { CSSProperties } from 'react';

export const LAYOUT: SxProps<Theme> = {
  width: '99%',
  height: '100%',
  padding: 2,
  display: 'flex',
  flexWrap: 'wrap',
};

export const TEXT_MESSAGE: SxProps<Theme> = {
  fontWeight: 'bold',
  marginBottom: 1,
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

export const BANK_LOGO: CSSProperties = {
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

export const BANK_PAGE_CARD: SxProps<Theme> = {
  border: 'none',
  outline: 'none',
  '& .MuiCardHeader-root .MuiToolbar-root': { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
  '& .MuiCardHeader-root .MuiToolbar-root svg': { mx: 1, transform: 'translateY(-2px)' },
  '& .MuiCardContent-root': CARD_CONTENT,
  '& .MuiCardContent-root > .MuiStack-root > .MuiPaper-root': { ...BANK_CARD },
  '& .MuiCardContent-root > .MuiStack-root > .MuiPaper-root > img': BANK_LOGO,
};

export const NO_BANK_PAGE_CARD: SxProps<Theme> = {
  border: 'none',
  outline: 'none',
  '& .MuiCardContent-root': CARD_CONTENT,
  '& .MuiCardContent-root > .MuiPaper-root': NO_BANK_CARD,
  '& .MuiCardContent-root > .MuiPaper-root svg': BALANCE_ICON,
  '& .MuiCardContent-root > .MuiPaper-root > .MuiBox-root': { zIndex: 2, m: 5, '.MuiTypography-root': { fontSize: '1.3rem' } },
  '& .MuiCardContent-root > .MuiPaper-root > .MuiBox-root > .MuiTypography-root > a': HERE_LINK,
  '& .MuiCardContent-root > .MuiModal-root > .MuiBackdrop-root': { display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1999 },
};
