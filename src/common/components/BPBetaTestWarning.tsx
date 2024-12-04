import { Alert } from '@mui/material';

export const ShortWarning = () => (
  <Alert
    sx={{
      border: 'none',
      padding: '.2rem .9rem',
      opacity: 0.8,
      mr: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    severity='warning'
  >
    beta test
  </Alert>
);
