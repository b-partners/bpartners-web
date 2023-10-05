import { SxProps } from '@mui/material';

export const PRIMARY_CONTAINER: SxProps = {
  width: '100%',
  height: '90%',
  position: 'relative',
};

export const SECONDARY_CONTAINER: SxProps = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: 2,
  paddingLeft: 0,
  width: 500,
};

export const ICON_CONTAINER: SxProps = {
  flexGrow: 2,
  position: 'relative',
  '& img': {
    width: '160px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};
