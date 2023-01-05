import { Alert, AlertTitle } from '@mui/material';

export const COMMON_STYLE = {
  border: 'none',
  opacity: 0.85,
};

export const LongWarning = () => (
  <Alert
    severity='warning'
    sx={{
      ...COMMON_STYLE,
      position: 'fixed',
      zIndex: 3,
      bottom: '1rem',
      right: '1rem',
      height: 'auto',
      minWidth: '20rem',
    }}
  >
    <AlertTitle>Avertissement</AlertTitle>
    <strong>BPartners</strong> est actuellement en beta test
  </Alert>
);

export const ShortWarning = () => (
  <Alert
    sx={{
      ...COMMON_STYLE,
      padding: '.2rem .9rem',
      opacity: 0.8,
      mr: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: 'none',
    }}
    severity='warning'
  >
    beta test
  </Alert>
);
