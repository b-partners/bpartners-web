import { PALETTE_COLORS } from '@/bp-theme';
import { keyframes, SxProps } from '@mui/material';

export const CREDIT_POPUP_VISIBLE_MS = 5000;

const slideIn = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideOut = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
`;

const shrink = keyframes`
  0% { transform: scaleX(1); }
  100% { transform: scaleX(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 82, 27, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(255, 82, 27, 0); }
`;

export const AnalyseCreditPopupStyle: SxProps = {
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  zIndex: 1500,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  pl: 2,
  pr: 1,
  py: 1.25,
  borderRadius: '16px',
  overflow: 'hidden',
  color: '#0F172A',
  background: 'rgba(241,175,145,0.58)',
  border: '1px solid rgba(15, 23, 42, 0.06)',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
  backdropFilter: 'blur(16px) saturate(160%)',
  animation: `${slideIn} 360ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
  '&.is-closing': {
    animation: `${slideOut} 300ms ease forwards`,
  },
  '& .credit-popup-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: '50%',
    color: '#fff',
    background: `linear-gradient(135deg, #FF7A3D 0%, ${PALETTE_COLORS.neon_orange} 100%)`,
    animation: `${pulse} 2.4s ease-out infinite`,
  },
  '& .credit-popup-icon svg': {
    fontSize: 19,
  },
  '& .credit-popup-message': {
    whiteSpace: 'nowrap',
    color: 'rgba(15, 23, 42, 0.72)',
  },
  '& .credit-popup-value': {
    color: PALETTE_COLORS.neon_orange,
  },
  '& .credit-popup-close': {
    ml: 'auto',
    color: 'rgba(15, 23, 42, 0.5)',
    p: 0.5,
    transition: 'color 160ms ease, background-color 160ms ease',
    '&:hover': {
      color: '#0F172A',
      backgroundColor: 'rgba(15, 23, 42, 0.06)',
    },
  },
  '& .credit-popup-progress': {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 2,
    transformOrigin: 'left',
    background: `linear-gradient(90deg, ${PALETTE_COLORS.neon_orange} 0%, ${PALETTE_COLORS.peach} 100%)`,
    animationName: `${shrink}`,
    animationDuration: `${CREDIT_POPUP_VISIBLE_MS}ms`,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
  },
};
