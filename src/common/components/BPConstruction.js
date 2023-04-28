import { Alert } from '@mui/material';

export const COMMON_STYLE = {
  border: 'none',
  opacity: 0.85,
};

export const BPConstruction = () => (
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
      width: 300,
      position: 'absolute',
      bottom: 20,
      right: 5,
    }}
    severity='warning'
  >
    🚧 En cours de construction.
  </Alert>
);
