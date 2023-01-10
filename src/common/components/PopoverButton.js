import { IconButton, Popover, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

/**
 * @param {*} props icon, label, children, style
 *
 * On click on the button, show a popover
 * Use the chidren props to edit the popover content
 */
const PopoverButton = props => {
  const { children, icon, label, style } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip data-testId='open-popover' sx={style} title={icon && label} onClick={handleClick}>
        {icon ? <IconButton>{icon}</IconButton> : <Typography>{label}</Typography>}
      </Tooltip>
      <Popover
        id={anchorEl && 'simple-popover'}
        open={anchorEl ? true : false}
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
