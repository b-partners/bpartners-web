import { Box, BoxProps } from '@mui/material';
import { FC } from 'react';

export const FlexBox: FC<BoxProps> = ({ sx = {}, ...boxProps }) => {
  return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }} {...boxProps} />;
};
