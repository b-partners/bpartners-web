import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorComponentStyle: SxProps = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  flexGrow: 1,
  minWidth: 0,
  height: 'calc(100vh - 124px)',
  '& > .annotator-canvas-container': {
    flexGrow: 1,
    position: 'relative',
    minWidth: 0,
    overflow: 'hidden',
    m: 0,
    p: 0,
  },
  '& .annotator-info': {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 999,
    background: PALETTE_COLORS.black,
    borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.2)',
    px: 1.5,
    py: 0.5,
    '& .MuiBox-root': {
      px: 0.5,
      '& p': {
        m: 0,
        fontSize: 11,
        fontFamily: "'Roboto Mono', monospace",
        fontWeight: 500,
        color: PALETTE_COLORS.cream,
      },
    },
  },
  '& .image-properties-actions': {
    width: '100%',
    '& > *:not([data-cy="center-img-btn"])': {
      flexGrow: 1,
    },
  },
  '& .bottom-action': {
    width: '100%',
    gap: 1,
    mb: 1,
    display: 'flex',
    justifyContent: 'space-between',
    '& .analyse-roof-button': {
      alignSelf: 'flex-end',
    },
    '& .MuiStack-root': {
      background: PALETTE_COLORS['pine'],
      color: PALETTE_COLORS['cream'],
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderRadius: 1,
      '& .MuiDivider-root': {
        borderColor: PALETTE_COLORS['cream'],
      },
    },
  },
  '& .switch-llm-result-tooltip': {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  '& .switch-llm-result-button': {
    background: PALETTE_COLORS['neon_orange'],
    color: PALETTE_COLORS['white'],
  },
  '& .global-rage-container ': {
    '& .MuiTypography-root': {
      textAlign: 'center',
      width: '100%',
      px: 2,
      py: 0.7,
      border: '1px solid black',
      background: PALETTE_COLORS.pine,
      borderRadius: 3,
      color: '#fff',
      fontWeight: 'bold',
    },
  },

  '& .degradation-levels': {
    '& .degradation-dot': {
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 14,
      color: 'rgba(0,0,0,.45)',
      opacity: 0.4,
      cursor: 'pointer',
      transition: 'all .3s ease',
      '&:hover': {
        opacity: 0.75,
        transform: 'scale(1.1)',
      },
    },
    '& .degradation-pill-active': {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 0.75,
      borderRadius: 50,
      color: '#fff',
      fontWeight: 600,
      boxShadow: '0 3px 12px rgba(0,0,0,.15)',
    },
    '& .degradation-pill-letter': {
      width: 32,
      height: 32,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 15,
      fontWeight: 700,
    },
    '& .degradation-pill-value': {
      fontSize: 14,
      fontWeight: 700,
    },
  },
};

export const analyseRoofButtonStyle: SxProps = {
  height: 50,
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
};
