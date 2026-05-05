import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorComponentStyle: SxProps = {
  width: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  mb: 5,
  '& > .annotator-canvas-container': {
    flexGrow: 1,
    position: 'relative',
    m: 0,
    p: 0,
    marginBlock: 1,
    height: '80vh',
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

  '& .degratation-levels': {
    mt: 0,
    pt: 0,
    '& .degratation-levels-box': {
      width: 40,
      height: 40,
      mt: 0,
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 500ms',
      cursor: 'pointer',
    },
    '&:hover': {
      '& .degratation-levels-box:not(.degratation-levels-box-selected)': {
        background: '#D9D9D9',
      },
      '& .degratation-levels-box-selected': {
        transform: 'scale(120%)',
        mx: 2,
      },
    },
  },
};

export const analyseRoofButtonStyle: SxProps = {
  height: 50,
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
};
