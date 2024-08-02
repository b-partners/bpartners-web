import { IconButton, Popover, SxProps, Tooltip, Typography } from '@mui/material';
import { FC, MouseEvent, ReactElement, ReactNode, useState } from 'react';

/**
 * @param {*} props icon, label, children, style
 *
 * On click on the button, show a popover
 * Use the chidren props to edit the popover content
 */
export type PopoverButtonProps = { children: ReactNode; icon: ReactElement; label: string; style?: SxProps; disabled?: boolean; 'data-testid'?: string };

const PopoverButton: FC<PopoverButtonProps> = props => {
  const { children, icon, label, style, disabled } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip data-testid={props['data-testid'] || 'open-popover'} sx={style} title={icon && label} onClick={handleClick}>
        <span>{icon ? <IconButton disabled={disabled}>{icon}</IconButton> : <Typography>{label}</Typography>}</span>
      </Tooltip>
      <Popover
        id={anchorEl && 'simple-popover'}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {children}
      </Popover>
    </>
  );
};

export default PopoverButton;
