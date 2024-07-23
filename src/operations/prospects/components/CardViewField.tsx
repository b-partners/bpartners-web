import { Typography } from '@mui/material';
import { cloneElement, ReactElement } from 'react';

interface CardViewFieldProps {
  value: string;
  icon: ReactElement;
}

export const CardViewField = ({ value, icon }: CardViewFieldProps) => (
  <Typography variant='body2'>
    {cloneElement(icon, { fontSize: 'small', sx: { position: 'relative', top: 6 } })} {value || 'Non renseigné'}
  </Typography>
);
