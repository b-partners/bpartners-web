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

export const roofSurfacesListStyle: SxProps = {
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 5,
  width: 240,
  maxHeight: 'calc(100% - 32px)',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 1.5,
  boxShadow: 3,
  overflow: 'hidden',
  '& .roof-list-header': {
    p: 1.5,
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    bgcolor: 'rgba(0,0,0,0.03)',
  },
  '& .roof-list-title': {
    fontSize: 14,
    fontWeight: 600,
    color: 'text.primary',
  },
  '& .roof-list-total': {
    fontSize: 12,
    color: 'text.secondary',
    mt: 0.25,
  },
  '& .roof-list-items': {
    overflowY: 'auto',
    py: 0.5,
  },
  '& .roof-list-item': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    px: 1.5,
    py: 1,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    '&:hover': { bgcolor: 'rgba(250, 187, 86, 0.15)' },
  },
  '& .roof-list-item-selected': {
    bgcolor: 'rgba(250, 187, 86, 0.3)',
    '&:hover': { bgcolor: 'rgba(250, 187, 86, 0.35)' },
  },
  '& .roof-list-item-label': {
    fontSize: 13,
    fontWeight: 500,
  },
  '& .roof-list-item-area': {
    fontSize: 12,
    color: 'text.secondary',
    fontVariantNumeric: 'tabular-nums',
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
