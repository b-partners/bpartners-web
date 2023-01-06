import { IconButton, Tooltip } from '@mui/material';

const TooltipButton = ({ icon, ...others }) => (
  <Tooltip {...others} sx={{ margin: '0 15px' }}>
    <IconButton>{icon}</IconButton>
  </Tooltip>
);

export default TooltipButton;
