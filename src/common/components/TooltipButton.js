import { IconButton, Tooltip } from '@mui/material';

const TooltipButton = ({ icon, disabled, ...others }) => (
  <Tooltip {...others} sx={{ margin: '0 15px' }}>
    <IconButton disabled={disabled}>{icon}</IconButton>
  </Tooltip>
);

export default TooltipButton;
