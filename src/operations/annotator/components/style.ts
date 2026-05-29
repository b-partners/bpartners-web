import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const FreeAutocompleteInputStyle: SxProps = {
  width: '100%',
};

export const annotatorActionButtonsStyle: SxProps = {
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 999,
  background: '#2c2c2c',
  borderRadius: '12px',
  px: 0.5,
  py: 0.5,
  boxShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
  '& svg': {
    color: 'white',
  },
  '& .MuiIconButton-root': {
    borderRadius: '8px',
    width: 36,
    height: 36,
    background: 'transparent',
    transition: 'background 0.15s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
    '&:active': {
      background: 'rgba(255,255,255,0.15)',
    },
  },
  '& .MuiDivider-root': {
    borderColor: 'rgba(255,255,255,0.12)',
    my: 0.5,
  },
  '& .shift-toggle': {
    '& svg': { transform: 'rotate(-90deg)' },
  },
  '& .shift-toggle-expanded': {
    '& svg': { transform: 'rotate(90deg)' },
  },
  '& .shift-up': {
    '& svg': { transform: 'rotate(-90deg)' },
  },
  '& .shift-down': {
    '& svg': { transform: 'rotate(90deg)' },
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
