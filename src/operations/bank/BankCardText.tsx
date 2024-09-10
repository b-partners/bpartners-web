import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import { TEXT_MESSAGE } from './style';
import { BankCardTextProps } from './types';

export const BankCardText: FC<BankCardTextProps> = ({ title, label, ...others }) => (
  <Box {...others}>
    <Typography variant='caption'>{title}</Typography>
    <Typography sx={TEXT_MESSAGE}>{label}</Typography>
  </Box>
);
