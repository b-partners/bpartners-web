import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotatorActionButtonsStyle: SxProps = {
  width: '100%',
  '& .MuiBox-root:nth-child(1)': {
    flexGrow: 1,
    height: '100%',
  },
  '& .MuiBox-root:nth-child(1) > .MuiBox-root': {
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: PALETTE_COLORS['pine'],
    color: PALETTE_COLORS['cream'],
    borderRadius: 1,
  },
  '& .MuiIconButton-root': {
    borderRadius: 2,
    background: PALETTE_COLORS['neon_orange'],
    color: PALETTE_COLORS['white'],
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
