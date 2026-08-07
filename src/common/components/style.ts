import { SxProps } from '@mui/material';

export const SirenModalStyle: SxProps = {
  minWidth: 420,
  paddingTop: 1,
  '& .siren-description': {
    marginBottom: 2,
    fontSize: '0.9rem',
  },
  '& .siren-input': {
    width: '100%',
  },
};

export const SlashIconStyle: SxProps = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateY(-4px)',
  '& .slash-line': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(45deg)',
    borderTop: '2px solid white',
    width: '100%',
    height: '4px',
    bgcolor: '#757575',
    pointerEvents: 'none',
  },
};

export const SubscriptionConsentStyle: SxProps = {
  minWidth: 420,
  maxWidth: 520,
  paddingTop: 1,
  '& .consent-intro': {
    marginBottom: 2,
    fontSize: '0.95rem',
  },
  '& .consent-highlight': {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    padding: 2,
    borderRadius: 2,
    bgcolor: '#f7f5ef',
    marginBottom: 2,
  },
  '& .consent-highlight-label': {
    fontSize: '0.8rem',
    color: '#6B6B6B',
  },
  '& .consent-highlight-value': {
    fontWeight: 700,
  },
  '& .consent-auto-renewal': {
    marginBottom: 1.5,
    alignItems: 'flex-start',
  },
  '& .consent-auto-renewal .MuiFormControlLabel-label': {
    fontSize: '0.85rem',
    paddingTop: 0.75,
  },
  '& .consent-cgu': {
    fontSize: '0.85rem',
    color: '#6B6B6B',
  },
  '& .consent-cgu a': {
    color: '#2196F3',
    fontWeight: 600,
  },
};

export const SubscriptionRedirectStyle: SxProps = {
  minWidth: 420,
  paddingY: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 3,
  '& .redirect-arrow': {
    width: 76,
    height: 76,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'rgba(33, 150, 243, 0.12)',
    color: '#2196F3',
  },
  '& .redirect-arrow svg': {
    fontSize: 42,
    animation: 'redirect-arrow-move 1.1s ease-in-out infinite',
  },
  '@keyframes redirect-arrow-move': {
    '0%': { transform: 'translateX(-8px)', opacity: 0.35 },
    '50%': { transform: 'translateX(8px)', opacity: 1 },
    '100%': { transform: 'translateX(-8px)', opacity: 0.35 },
  },
  '& .redirect-title': {
    fontWeight: 700,
    fontSize: '1.05rem',
  },
  '& .redirect-subtitle': {
    color: '#6B6B6B',
    fontSize: '0.9rem',
  },
};
