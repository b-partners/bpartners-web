import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorComponentStyle: SxProps = {
  height: '95%',
  width: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  '& > .annotator-canvas-container': {
    flexGrow: 1,
    position: 'relative',
    m: 0,
    p: 0,
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
    '& > .analyse-roof-button': {
      height: '100%',
      p: 0,
      m: 0,
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
};
