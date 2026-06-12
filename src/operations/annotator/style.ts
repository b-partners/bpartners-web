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
    height: 'calc(100vh - 120px)',
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
    alignItems: 'center',
  },
  '& .toolbar-back-btn': {
    borderRadius: 1,
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
  justifyContent: 'space-between',
  '& .bottom-toolbar-actions': {
    alignItems: 'center',
  },
  '& .bottom-toolbar-regenerate-btn, & .bottom-toolbar-export-btn, & .bottom-toolbar-save-btn': {
    textTransform: 'none',
    whiteSpace: 'nowrap',
  },
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
};

export const annotatorDisclaimerStyle: SxProps = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  zIndex: (theme: any) => theme.zIndex.drawer + 2,
  textAlign: 'center',
  fontSize: 12,
  fontStyle: 'italic',
  color: 'text.secondary',
  py: 0.5,
};
