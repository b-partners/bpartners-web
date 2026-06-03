import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const ScreenSwitchTabsStyle: SxProps = {
  display: 'inline-flex',
  background: '#f3f3f4',
  padding: '3px',
  borderRadius: '8px',
  gap: '2px',
  marginInline: 1,
  '& .screen-tab': {
    minHeight: 'unset',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b6b6b',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    textTransform: 'none',
    boxShadow: 'none',
    background: 'transparent',
    border: 'none',
    lineHeight: 1.2,
  },
  '& .screen-tab:hover': {
    background: 'rgba(0,0,0,0.04)',
    boxShadow: 'none',
  },
  '& .screen-tab.active': {
    background: '#ffffff',
    color: PALETTE_COLORS.forest,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  '& .screen-tab.Mui-disabled': {
    opacity: 0.45,
    cursor: 'not-allowed',
    color: '#9a9a9a',
    background: 'transparent',
    boxShadow: 'none',
  },
  '& .screen-tab.Mui-disabled:hover': {
    background: 'transparent',
  },
  '& .screen-tab.Mui-disabled .MuiSvgIcon-root': {
    color: '#bdbdbd',
  },
  '& .screen-tab .MuiSvgIcon-root': {
    fontSize: '16px',
  },
  '& .tab-badge': {
    background: '#FFE4D9',
    color: PALETTE_COLORS.neon_orange,
    fontSize: '10px',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    lineHeight: 1.4,
  },
};
