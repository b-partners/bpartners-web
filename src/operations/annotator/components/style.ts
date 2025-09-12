import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorActionButtonsStyle: SxProps = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
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
      py: 1,
      borderRadius: 2,
      minWidth: 70,
      fontWeight: 'semi-bold',
      background: PALETTE_COLORS.neon_orange,
    },
  },
  '& .image-info': {
    background: PALETTE_COLORS.pine,
    borderRadius: 2,
    width: '100%',
    display: 'flex',
    py: 1,
    justifyContent: 'center',
    '& .MuiTypography-root': {
      color: '#fff',
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
