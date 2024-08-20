import * as icons from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { FC } from 'react';
import { IconTipButtonProps } from '../types';

export const IconTipButton: FC<IconTipButtonProps> = ({ icon, title, ...props }) => {
  const Icon = icons[icon];
  return (
    <span>
      <Tooltip title={title}>
        <IconButton {...props}>
          <Icon />
        </IconButton>
      </Tooltip>
    </span>
  );
};
