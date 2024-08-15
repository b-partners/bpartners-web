import { Error as ErrorIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import { ErrorHandlingStyle } from './style';
import { ErrorHandlingProps } from './types';

export const PdfErrorHandling: FC<ErrorHandlingProps> = ({ message }) => (
  <Box sx={ErrorHandlingStyle}>
    <ErrorIcon />
    <Typography variant='body2'>{message}</Typography>
  </Box>
);
