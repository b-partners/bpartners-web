import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const annotationHelpButtonStyle: SxProps = {
  color: PALETTE_COLORS.forest,
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.12)',
  borderRadius: '8px',
  padding: '5px',
  marginLeft: 1,
  transition: 'all 0.15s',
  '&:hover': {
    background: 'rgba(255,82,27,0.08)',
    borderColor: PALETTE_COLORS.neon_orange,
    color: PALETTE_COLORS.neon_orange,
  },
};

export const annotationHelpDialogStyle: SxProps = {
  '& .MuiDialog-paper': {
    borderRadius: '18px',
    overflow: 'hidden',
    maxWidth: 980,
    width: '100%',
  },
  '& .help-topbar': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 22px',
    background: `linear-gradient(135deg, ${PALETTE_COLORS.forest} 0%, ${PALETTE_COLORS.pine} 100%)`,
    color: '#fff',
  },
  '& .help-brand-mark': {
    width: 30,
    height: 30,
    borderRadius: '8px',
    background: PALETTE_COLORS.neon_orange,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: '.5px',
  },
  '& .help-brand-text': {
    fontWeight: 700,
    letterSpacing: '.6px',
    fontSize: 14,
    lineHeight: 1.2,
  },
  '& .help-brand-sub': {
    color: 'rgba(255,255,255,.65)',
    fontSize: 11.5,
    fontWeight: 500,
    letterSpacing: '.2px',
  },
  '& .help-close': {
    background: 'rgba(255,255,255,.10)',
    color: '#fff',
    width: 30,
    height: 30,
    '&:hover': { background: 'rgba(255,255,255,.22)' },
  },
  '& .help-stage': {
    position: 'relative',
    width: '100%',
    minHeight: 420,
    maxHeight: '70vh',
    background: '#0c160f',
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 2,
  },
  '& .help-frame': {
    animation: 'helpFrameFade .5s ease',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    '& .help-video': {
      width: '100%',
      maxHeight: '70vh',
      borderRadius: '8px',
      boxShadow: '0 12px 40px rgba(0,0,0,.45)',
      margin: '0 auto',
      background: '#000',
    },
  },
  '& .help-frame-hidden': {
    display: 'none',
  },
  '@keyframes helpFrameFade': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '& .help-loader': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
    width: '100%',
    color: 'rgba(255,255,255,.7)',
  },
};
