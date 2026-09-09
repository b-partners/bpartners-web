import { SxProps } from '@mui/material';

export const EarthSatellitesStyle: SxProps = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  background: 'transparent',
  '& .motion-wrapper': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& image': {
      objectFit: 'fill',
    },
  },
  '& .svg-root': {
    width: 300,
    height: 300,
    overflow: 'visible',
  },
};

export const ScreenShotAnimationStyle: SxProps = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: 'transparent',

  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },

  '& .city-wrapper': {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: '48% 42%',
    overflow: 'hidden',
    zIndex: 1,
  },

  '& .city-img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  '& .target-box': {
    position: 'absolute',
    top: '38%',
    left: '44%',
    width: '14%',
    height: '12%',
    pointerEvents: 'none',
  },

  '& .corner': {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderColor: '#4fc3f7',
    borderStyle: 'solid',
    boxShadow: '0 0 8px rgba(79,195,247,0.9)',
  },

  '& .tl': { top: 0, left: 0, borderWidth: '2px 0 0 2px' },
  '& .tr': { top: 0, right: 0, borderWidth: '2px 2px 0 0' },
  '& .bl': { bottom: 0, left: 0, borderWidth: '0 0 2px 2px' },
  '& .br': { bottom: 0, right: 0, borderWidth: '0 2px 2px 0' },

  '& .flash-overlay': {
    position: 'absolute',
    inset: 0,
    bgcolor: 'white',
    pointerEvents: 'none',
  },

  '& .scan-line': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8px',
    background: 'linear-gradient(180deg, rgba(79,195,247,0.95) 0%, rgba(79,195,247,0) 100%)',
    pointerEvents: 'none',
    boxShadow: '0 0 14px 5px rgba(79,195,247,0.4)',
  },

  '& .photo-wrapper': {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    boxSizing: 'border-box',
    zIndex: 2,
    pointerEvents: 'none',
  },

  '& .photo-frame': {
    position: 'relative',
    width: '100%',
    height: '100%',
    bgcolor: 'white',
    borderRadius: '6px',
    padding: '10px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },

  '& .photo-inner': {
    width: '100%',
    height: '100%',
    borderRadius: '3px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  '& .roof-img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  '& .skeleton-shimmer': {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 3,
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
      animation: 'shimmer 2s ease-in-out infinite',
    },
  },

  '& .photo-corner': {
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderColor: '#4fc3f7',
    borderStyle: 'solid',
  },

  '& .pc-tl': { top: 6, left: 6, borderWidth: '2px 0 0 2px', borderRadius: '2px 0 0 0' },
  '& .pc-tr': { top: 6, right: 6, borderWidth: '2px 2px 0 0', borderRadius: '0 2px 0 0' },
  '& .pc-bl': { bottom: 6, left: 6, borderWidth: '0 0 2px 2px', borderRadius: '0 0 0 2px' },
  '& .pc-br': { bottom: 6, right: 6, borderWidth: '0 2px 2px 0', borderRadius: '0 0 2px 0' },
};

export const LoadingStepsStyle: SxProps = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1,
  flexWrap: 'nowrap',
  mb: 2,

  '& .chip-wrapper': {
    overflow: 'visible',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },

  '& .chip-morph': {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  '& .step-chip': {
    height: '32px',
    whiteSpace: 'nowrap',
    borderRadius: '0px',
    border: 'none',
    '& .MuiChip-label': {
      px: '10px',
    },
  },

  '& .step-chip--current': {
    bgcolor: '#FFC107',
    color: 'white',
    '& .MuiChip-label': {
      px: '10px',
    },
  },

  '& .step-chip--done': {
    bgcolor: '#4caf50',
    color: 'white',
    width: '32px',
    height: '32px',
    minWidth: 'unset',
    padding: 0,
    borderRadius: '0px',
    '& .MuiChip-label': {
      px: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
  },

  '& .shimmer-overlay': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
    pointerEvents: 'none',
    zIndex: 2,
  },

  '& .chip-content': {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
    zIndex: 1,
  },

  '& .chip-index': {
    fontWeight: 700,
    fontSize: '0.85rem',
    lineHeight: 1,
    flexShrink: 0,
  },

  '& .chip-label': {
    fontSize: '0.8rem',
    overflow: 'hidden',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
};
