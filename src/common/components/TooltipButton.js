import { IconButton, Tooltip } from '@mui/material';

const TooltipButton = ({ icon, disabled, onClick, ...others }) => (
  <Tooltip {...others} sx={{ margin: '0 6px' }}>
    <IconButton onClick={onClick} disabled={disabled}>
      {icon}
    </IconButton>
  </Tooltip>
);

export default TooltipButton;
