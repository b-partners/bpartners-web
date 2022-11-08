import { Alert, AlertTitle } from '@mui/material';

export const LongWarning = () => (
  <Alert severity='warning' sx={{ opacity: 1 }}>
    <AlertTitle>Avetissement</AlertTitle>
    <strong>bpartners est actuellement en beta test</strong>
  </Alert>
);

export const ShortWarning = () => (
  <Alert
    sx={{
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
