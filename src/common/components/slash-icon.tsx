import { Box } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import { SlashIconStyle } from './style';

interface SlashIconProps extends PropsWithChildren {
  active: boolean;
}

export const SlashIcon: FC<SlashIconProps> = props => {
  return (
    <Box sx={SlashIconStyle}>
      {props.children}
      {!props.active && <Box className='slash-line' />}
    </Box>
  );
};
