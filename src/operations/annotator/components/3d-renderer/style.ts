import { CSSProperties } from 'react';

export const faceMeasureLabelStyle = {
  distanceMeterSpan: (edge: any) => ({
    color: edge.color,
    fontSize: '13px',
    fontWeight: 'bold',
    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    whiteSpace: 'nowrap',
  }),
  areaSpan: {
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '13px',
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

export const polygonMeasureLineStyle = {
  measureSpan: (color: any) => ({
    color,
    fontSize: '12px',
    fontWeight: 'bold',
    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
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
