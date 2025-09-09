import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorActionButtonsStyle: SxProps = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  '& .MuiIconButton-root': {
    borderRadius: 2,
    background: PALETTE_COLORS['neon_orange'],
    color: PALETTE_COLORS['white'],
  },
  '& .annotator-info': {
    transform: 'translateY(-30%)',
    '& .MuiBox-root > .MuiBox-root': {
      border: '1px solid black',
      px: 1,
      borderRadius: 2,
      mb: 0.2,
      background: 'transparent !important',
      color: 'black',
      fontWeight: 'bold',
      fontSize: 5,
    },
  },
};

export const llmResultStyle: SxProps = {
  textAlign: 'justify',
  padding: 5,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  overflowY: 'scroll',
  overflowX: 'hidden',
  '& h1': {
    mb: 5,
  },
  '& li': {
    mb: 2,
  },
  '& strong': {
    display: 'block',
  },
};

export const llmButtonStyle: SxProps = {
  color: 'white',
  '& svg': {
    color: 'white',
  },
};
