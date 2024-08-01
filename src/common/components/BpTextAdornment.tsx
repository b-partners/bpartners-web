import { SxProps, Typography } from '@mui/material';
import { FC } from 'react';

export type BpTextAdornmentProps = {
  label: string;
  sx: SxProps;
};

const BpTextAdornment: FC<BpTextAdornmentProps> = ({ label, sx }) => <Typography sx={{ position: 'relative', top: 10, ...sx }}>{label}</Typography>;

export default BpTextAdornment;
