import { SxProps } from '@mui/material';

export const SlashIconStyle: SxProps = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateY(-4px)',
  '& .slash-line': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(45deg)',
    borderTop: '2px solid white',
    width: '100%',
    height: '4px',
    bgcolor: '#757575',
    pointerEvents: 'none',
  },
};
