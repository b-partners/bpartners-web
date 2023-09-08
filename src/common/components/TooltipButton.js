import { IconButton, Tooltip } from '@mui/material';

const TooltipButton = ({ icon, disabled, onClick, ...others }) => (
  <Tooltip {...others} sx={{ margin: '0 15px' }}>
    <span>
      <IconButton onClick={onClick} disabled={disabled}>
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);

export default TooltipButton;
