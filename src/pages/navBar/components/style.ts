import { PALETTE_COLORS } from '@/common/config/theme';
import { SxProps } from '@mui/material';

export const NavBarStyle: SxProps = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 2,
  py: 1,
  bgcolor: PALETTE_COLORS.white,
  height: '80px',

  '& .navbar-logo': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontWeight: 'bold',
    fontSize: '2rem',
  },

  '& .navbar-center-box': {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    px: 3,
    py: 1,
    borderRadius: 6,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    bgcolor: '#fff',
    minHeight: '60px',
    width: 600,
  },

  '& .navbar-divider': {
    width: 2,
    height: 24,
    bgcolor: '#E0E0E0',
    mx: 1,
  },

  '& .navbar-icon-button': {
    borderBottom: '3px solid transparent',
    borderRadius: 0,
    transition: 'border-bottom 0.2s ease',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  '& .navbar-icon-active': {
    borderBottom: `3px solid ${PALETTE_COLORS.neon_orange}`,
  },

  '& .navbar-search-box': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: 520,
    bgcolor: '#fff',
    px: 2,
    py: 0.5,
    borderRadius: 2,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
    border: `1px solid ${PALETTE_COLORS.black}`,
    zIndex: 10,
  },

  '& .navbar-profile': {
    px: 2,
    py: 1,
    borderRadius: '25%',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};
