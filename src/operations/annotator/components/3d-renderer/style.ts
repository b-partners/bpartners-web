import { SxProps } from '@mui/material';
import { CSSProperties } from 'react';

export const faceMeasureLabelStyle = {
  distanceMeterSpan: (edge: any) => ({
    color: edge.color,
    fontSize: '16px',
    fontWeight: 'bold',
    background: 'rgba(0,0,0,0.75)',
    padding: '4px 10px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  }),
  areaSpan: {
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
};

export const pointMeasureLineStyle = {
  measuresContainer: {
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as CSSProperties,
};

export const panCapturesButtonStyle: Record<string, SxProps> = {
  button: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    boxShadow: 3,
  },
};

export const panCapturesDialogStyle: Record<string, SxProps> = {
  content: {
    minWidth: { xs: 320, sm: 600, md: 800 },
    minHeight: 200,
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    py: 6,
  },
  empty: {
    textAlign: 'center',
    py: 6,
    color: 'text.secondary',
  },
  card: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    overflow: 'hidden',
    bgcolor: 'background.paper',
    '& .pan-image': {
      width: '100%',
      display: 'block',
      backgroundColor: '#1e1e1e',
    },
    '& .pan-label': {
      textAlign: 'center',
      py: 1,
      fontWeight: 600,
    },
  },
};

export const polygonMeasureLineStyle = {
  measureSpan: (color: any) => ({
    color,
    fontSize: '14px',
    fontWeight: 'bold',
    background: 'rgba(0,0,0,0.75)',
    padding: '3px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  }),
  measuresContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  } as CSSProperties,
  areaDiv: {
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  } as CSSProperties,
};
