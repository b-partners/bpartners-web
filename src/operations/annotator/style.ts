import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const addressStyle: SxProps = {
  justifyContent: 'space-between',
  alignItems: 'center',
  '& > .MuiStack-root:first-child': {
    border: `1px solid ${PALETTE_COLORS['neon_orange']}`,
    width: 'fit-content',
    height: 'fit-content',
    borderRadius: 1,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    color: PALETTE_COLORS['neon_orange'],
    py: 0.3,
    px: 1,
  },
  '& .MuiTypography-root': {
    color: PALETTE_COLORS['neon_orange'],
    width: 'fit-content',
    height: 'fit-content',
  },
};

export const SIDEBAR_DRAWER_WIDTH = 380;

export const sideBarStyle: SxProps = {
  width: SIDEBAR_DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: SIDEBAR_DRAWER_WIDTH,
    borderLeft: '1px solid',
    borderColor: 'divider',
    paddingLeft: 1,
    boxSizing: 'border-box',
    top: 62,
    height: 'calc(100vh - 124px)',
    overflow: 'hidden',
  },
  '& .sidebar-content': {
    pb: '50px',
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 1,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  '& .sidebar-empty': {
    display: 'flex',
    color: '#00000050',
    mt: '2rem',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
  },
  '& .sidebar-empty-icon': {
    fontSize: '6rem',
  },
  '& .sidebar-empty-text': {
    width: 200,
    textAlign: 'center',
  },
};

export const analyseResultButtonsStyle: SxProps = {
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  '& .MuiButton-root': {
    minWidth: 300,
  },
  '& .draft-save-btn:enabled': {
    background: PALETTE_COLORS.pine,
    color: '#fff',
  },
  '& .export-analyse-btn:enabled': {
    background: PALETTE_COLORS.forest,
    color: '#fff',
  },
};

export const annotatorAppBarStyle: SxProps = {
  border: 'none',
  margin: 0,
  zIndex: (theme: any) => theme.zIndex.drawer + 1,
  '& .toolbar-logo-stack': {
    flexGrow: 1,
  },
  '& .toolbar-logo': {
    objectFit: 'contain',
    width: '5rem',
  },
  '& .toolbar-divider-left': {
    ml: 1,
  },
  '& .toolbar-address-skeleton': {
    width: '7rem',
  },
  '& .toolbar-select': {
    minWidth: '10rem',
  },
  '& .toolbar-3d-btn': {
    textTransform: 'none',
    fontSize: 11,
    px: 1.5,
    py: 0.25,
    mx: 0.5,
    whiteSpace: 'nowrap',
  },
  '& .toolbar-menu-item': {
    py: 1,
  },
};

export const annotatorPopoverPaperStyle: SxProps = {
  minWidth: 200,
  py: 0.5,
  borderRadius: '0 0 4px 4px',
  boxShadow: '0 2px 4px -1px rgba(0,0,0,.1)',
  borderTop: 'none',
};

export const annotatorContentStyle: SxProps = {
  height: '100%',
  pl: 1,
  mt: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'start',
  position: 'relative',
};

export const annotatorBottomToolbarStyle: SxProps = {
  zIndex: (theme: any) => theme.zIndex.drawer + 1,
  background: 'white',
  '& .global-rage-container ': {
    '& .MuiTypography-root': {
      textAlign: 'center',
      width: '100%',
      px: 2,
      py: 0.7,
      border: '1px solid black',
      background: PALETTE_COLORS.pine,
      borderRadius: 3,
      color: '#fff',
      fontWeight: 'bold',
    },
  },
  '& .degradation-fieldset': {
    position: 'relative',
    px: 1.5,
    pt: 1.5,
    pb: 1,
    '& .degradation-legend': {
      position: 'absolute',
      top: -4,
      left: 10,
      transform: 'translateY(-50%)',
      bgcolor: 'white',
      px: 1,
      py: 0.25,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: (theme: any) => theme.palette.secondary.main,
      borderRadius: 1,
      lineHeight: 1,
    },
  },
  '& .degradation-levels': {
    '& .degradation-dot': {
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 14,
      color: 'rgba(0,0,0,.45)',
      opacity: 0.4,
      cursor: 'pointer',
      transition: 'all .3s ease',
      '&:hover': {
        opacity: 0.75,
        transform: 'scale(1.1)',
      },
    },
    '& .degradation-pill-active': {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 0.75,
      borderRadius: 50,
      color: '#fff',
      fontWeight: 600,
      boxShadow: '0 3px 12px rgba(0,0,0,.15)',
    },
    '& .degradation-pill-letter': {
      width: 32,
      height: 32,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 15,
      fontWeight: 700,
    },
    '& .degradation-pill-value': {
      fontSize: 14,
      fontWeight: 700,
    },
  },
};

export const annotatorDisclaimerStyle: SxProps = {
  zIndex: (theme: any) => theme.zIndex.drawer + 1,
  textAlign: 'center',
  width: '100%',
  fontSize: 12,
  fontStyle: 'italic',
  color: 'text.secondary',
  background: 'white',
};
