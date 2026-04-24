import { Box, BoxProps } from '@mui/material';
import { FC } from 'react';

interface SlashIconProps extends BoxProps {
  active: boolean;
}

export const SlashIcon: FC<SlashIconProps> = props => {
  return (
    <>
      {props.children}
      {!props.active && <Box className='slash-line' />}
    </>
  );
};
