import * as Icons from '@mui/icons-material';
import { IconButton, Paper, Typography } from '@mui/material';
import { FC } from 'react';
import { InfoShowStyle } from './styles';
import { InfoShowProps } from './types';

export const InfoShow: FC<InfoShowProps> = ({ content, icon, color, ...others }) => {
  const Icon = Icons[icon];
  return (
    <Paper sx={InfoShowStyle}>
      <IconButton size='large' sx={{ color }}>
        <Icon />
      </IconButton>
      <Typography ml={3} variant='body1' {...others}>
        {content}
      </Typography>
    </Paper>
  );
};
