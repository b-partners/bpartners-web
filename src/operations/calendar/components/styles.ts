import { SxProps } from '@mui/material';

export const PRIMARY_CONTAINER: SxProps = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

export const SECONDARY_CONTAINER: SxProps = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translateX(-50%)',
};
