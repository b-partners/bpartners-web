import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorActionButtonsStyle: SxProps = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  zIndex: 999,
  '& svg': {
    color: 'white',
  },
  '& .MuiIconButton-root': {
    borderRadius: 2,
    background: PALETTE_COLORS['neon_orange'],
    color: PALETTE_COLORS['white'],
  },
  '& .annotator-info': {
    '& .MuiBox-root': {
      '& p': {
        m: 0,
      },
      color: '#fff',
      px: 1,
      py: 1.2,
      borderRadius: 2,
      minWidth: 70,
      fontWeight: 'semi-bold',
      background: PALETTE_COLORS.neon_orange,
      fontSize: 14,
    },
  },
  '& .image-info': {
    background: PALETTE_COLORS.pine,
    borderRadius: 2,
    width: '100%',
    display: 'flex',
    py: 1.2,
    justifyContent: 'center',
    '& .MuiTypography-root': {
      color: '#fff',
      fontSize: 14,
    },
    '& .MuiDivider-root': {
      marginX: 2,
    },
  },
  '& .image-info-container': {
    width: '100%',
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
