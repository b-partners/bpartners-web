import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const FreeAutocompleteInputStyle: SxProps = {
  width: '100%',
};

export const annotatorTopBarStyle: SxProps = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 999,
  background: 'transparent',
  px: 1,
  py: 0.5,
  '& .top-bar-select': {
    minWidth: '9rem',
    '& .MuiInputBase-root': {
      fontSize: 13,
    },
    '& .MuiInputLabel-root': {
      fontSize: 13,
    },
  },
  '& .top-bar-btn': {
    whiteSpace: 'nowrap',
    fontSize: 11,
    textTransform: 'none',
  },
  '& .MuiTextField-root': {
    maxWidth: 150,
  },
};

export const annotatorActionButtonsStyle: SxProps = {
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 999,
  background: PALETTE_COLORS.black,
  borderRadius: '12px',
  px: 0.5,
  py: 0.5,
  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
  '& svg': {
    color: PALETTE_COLORS.white,
  },
  '& .MuiIconButton-root': {
    borderRadius: '8px',
    width: 36,
    height: 36,
    background: 'transparent',
    transition: 'all 0.15s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
    '&:active': {
      background: 'rgba(255,255,255,0.15)',
    },
  },
  '& .MuiDivider-root': {
    borderColor: 'rgba(255,255,255,0.15)',
    my: 0.5,
  },
  '& .shift-toggle': {
    '& svg': { transform: 'rotate(-90deg)', color: PALETTE_COLORS.cream },
  },
  '& .shift-toggle-expanded': {
    '& svg': { transform: 'rotate(90deg)', color: PALETTE_COLORS.cream },
  },
  '& .shift-up': {
    '& svg': { transform: 'rotate(-90deg)' },
  },
  '& .shift-down': {
    '& svg': { transform: 'rotate(90deg)' },
  },
  '& .gen-mode-toggle': {
    color: PALETTE_COLORS.white,
    background: 'transparent',
    textTransform: 'none',
    fontSize: 12,
    height: 36,
    borderRadius: '8px',
    px: 1.25,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
    '&:active': {
      background: 'rgba(255,255,255,0.15)',
    },
  },
};

export const llmResultStyle: SxProps = {
  textAlign: 'justify',
  padding: 5,
  marginBottom: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  overflowY: 'scroll',
  overflowX: 'hidden',
  '& *': {
    fontFamily: "'Kumbh Sans', sans-serif !important",
  },
  '& h1': {
    mb: 5,
  },
  '& li': {
    mb: 2,
  },
  '& strong': {
    display: 'block',
  },
  '& h1,h2,h3': {
    textAlign: 'center',
  },
  '& section:first-child > h2': {
    color: PALETTE_COLORS.neon_orange,
  },
  '& section:nth-child(2) > h2': {
    color: PALETTE_COLORS.neon_orange,
  },
  '& .loading-container': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    '& .loading-element-container': {
      alignItems: 'center',
    },
  },
};

export const llmButtonStyle: SxProps = {
  color: 'white',
  minWidth: 300,
  '& svg': {
    color: 'white',
  },
};

export const annotationSlopeHeightAlertStyle: SxProps = {
  '& .MuiAlert-action button': {
    position: 'relative',
  },
  mb: 1,
};

export const annotatorFormResultItemStyle: SxProps = {
  '& .color-box-ref': {
    width: '30px',
    height: '30px',
    borderRadius: '5px',
    border: '1px solid black',
  },
};

export const annotatorFormItem: SxProps = {
  overflowX: 'hidden',
  '& .polygon-color-line': {
    width: '3px',
    height: '25px',
    mr: 1,
    borderRadius: '5px',
  },
  '& .svg-expanded-true': {
    '& svg': {
      transform: 'rotate(180deg)',
    },
  },
};

export const saveAnnotationsButtonStyle: SxProps = {
  width: {
    xs: '90%',
    md: '30%',
    lg: '20%',
  },
  position: 'fixed',
  bottom: '2%',
  right: '2%',
  zIndex: 999,
};
