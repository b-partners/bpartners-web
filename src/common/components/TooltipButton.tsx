import { IconButton, Tooltip, TooltipProps } from '@mui/material';
import { FC, MouseEvent, ReactNode } from 'react';

export type TooltipButtonProps = Omit<TooltipProps, 'children'> & {
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const TooltipButton: FC<TooltipButtonProps> = ({ icon, disabled, onClick, ...tooltipProps }) => (
  <Tooltip {...tooltipProps} sx={{ margin: '0 6px' }}>
    <IconButton onClick={onClick} disabled={disabled}>
      {icon}
    </IconButton>
  </Tooltip>
);

export default TooltipButton;
