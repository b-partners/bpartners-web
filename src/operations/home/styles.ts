import { BP_COLOR, PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const home_style: SxProps = {
  '& .illustration-container': {
    height: {
      xs: '40vh',
      lg: '50vh',
    },
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    background: 'url(/home/illustration.webp)',
    backgroundSize: '100%',
  },
  '& .illustration-container > .MuiBox-root': {
    width: 'fit-content',
    height: 'fit-content',
    bgcolor: '#ffffff90',
    m: 1,
    p: 1,
    pb: 0,
    borderRadius: 1,
  },
  '& .illustration-container > .MuiBox-root img': {
    width: {
      xs: 100,
      lg: 200,
    },
  },
  '& .address-input-container': {
    alignItems: 'center',
    height: 50,
    fontSize: 20,
    background: PALETTE_COLORS['pine'],
    display: 'flex',
    justifyContent: 'space-around',
    borderRadius: 2,
    mt: 1,
    color: 'white',
    px: 1,
    gap: 1,
    '& .input': {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      gap: 1,
      p: 0.5,
      borderRadius: 1,
    },
    '& .MuiInputBase-root': {
      color: 'white',
      flexGrow: 1,
      px: 1,
    },
    '& .MuiInputBase-root::placeholder': {
      color: 'black',
    },
  },
  '& .bento-container': {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    mt: 1,
    flexWrap: 'wrap',
    '& > .MuiPaper-root.latest-addresses': {
      flexGrow: 1,
      borderRadius: 2,
      minWidth: 500,
      border: 'none',
      position: 'relative',
    },
    '& > .MuiPaper-root': {
      height: 300,
      flexGrow: 1,
      minWidth: 350,
      position: 'relative',
      p: 0,
      m: 0,
    },
    '& > .MuiPaper-root:nth-child(3)': {
      borderRadius: 2,
      border: `2px solid ${PALETTE_COLORS['pine']}`,
    },
    '.MuiCircularProgress-root': {
      color: '#fff',
      position: 'absolute',
      top: '48%',
      left: '48%',
      transform: 'translate(-50%, -50%)',
    },
    '& > .MuiPaper-root.buttons-container': {
      border: 'none',
    },
    '& > .latest-addresses': {
      background: PALETTE_COLORS['pine'],
      border: 'none',
    },
  },
};

export const prospect_section_style: SxProps = {
  '& .MuiListItem-root': {
    color: 'white',
    '& .MuiListItemText-secondary': {
      color: '#ddd',
    },
  },
};

export const buttons_section_style: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  height: 300,
  '& > .MuiBox-root': {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '32%',
    '& > .MuiBox-root': {
      height: '100%',
      width: '49%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderRadius: 2,
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 200ms',
    },
  },
  '& > .MuiBox-root:nth-child(1) > .MuiBox-root': {
    border: `1px solid ${PALETTE_COLORS['pine']}`,
  },
  '& > .MuiBox-root:nth-child(1) > .MuiBox-root:nth-child(2):hover': {
    background: PALETTE_COLORS['pine'],
    color: 'white',
  },
  '& > .MuiBox-root:nth-child(2) > .MuiBox-root': {
    border: `1px solid ${BP_COLOR[5]}`,
    color: BP_COLOR[5],
  },
  '& > .MuiBox-root:nth-child(2) > .MuiBox-root:nth-child(2):hover': {
    background: PALETTE_COLORS['pine'],
    color: 'white',
  },
  '& > .MuiBox-root:nth-child(3) > .MuiBox-root': {
    background: PALETTE_COLORS['pine'],
    color: '#f4f4f4',
    border: `1px solid ${PALETTE_COLORS['pine']}`,
  },
  '& > .MuiBox-root:nth-child(3) > .MuiBox-root:nth-child(2):hover': {
    background: '#f4f4f4',
    color: BP_COLOR[5],
  },
};

export const prospect_button: SxProps = {
  position: 'relative',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiButtonBase-root': {
    background: PALETTE_COLORS['pine'],
    color: '#f4f4f4',
    position: 'absolute',
    bottom: 5,
    left: 5,
    transition: 'all 200ms',
  },
  '& .MuiButtonBase-root:hover': {
    color: PALETTE_COLORS['pine'],
    background: '#f4f4f4',
    border: `1px solid #090909`,
    transform: 'scale(1.2)',
  },
};
