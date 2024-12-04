import { Alert, SxProps } from '@mui/material';
import { FC } from 'react';

interface BPConstructionProps {
  sx?: SxProps;
}

export const BPConstruction: FC<BPConstructionProps> = ({ sx }) => (
  <Alert
    sx={{
      padding: '.2rem .9rem',
      opacity: 0.8,
      mr: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: 'none',
      width: 300,
      ...sx,
    }}
    severity='warning'
  >
    🚧 En cours de construction.
  </Alert>
);
