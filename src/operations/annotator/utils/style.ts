import { SxProps } from '@mui/material';

export const annotatorComponentStyle: SxProps = {
  height: '95%',
  width: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  '& > :nth-child(2)': {
    flexGrow: 1,
    position: 'relative',
    m: 0,
    p: 0,
  },
  '& .image-properties-actions': {
    width: '100%',
    '& > *:not(:nth-child(3))': {
      flexGrow: 1,
    },
  },
};
