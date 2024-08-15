import { IconButton } from '@mui/material';
import { FC, MouseEventHandler } from 'react';
import { RichToolbarButtonStyle } from './style';
import { RichToolbarButtonProps } from './types';

export const RichToolbarButton: FC<RichToolbarButtonProps> = ({ onToggle, label, active, style, children }) => {
  const _onToggle: MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    onToggle(style);
  };

  return (
    <IconButton size='small' style={{ background: active && '#E7E7E7' }} data-testid={label} onClick={_onToggle} title={label} sx={RichToolbarButtonStyle}>
      {children}
    </IconButton>
  );
};
