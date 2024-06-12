import { Box, CircularProgress, SxProps, Typography } from '@mui/material';
import { BP_COLOR } from '../../bp-theme';

export type BpLoaderProps = {
  sx?: SxProps;
  messageSx?: SxProps;
  message?: string;
};

const LOADER_SX: SxProps = {
  width: '100vw',
  height: '90vh',
  margin: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 1,
};

export const BPLoader = ({ sx = {}, messageSx = {}, message }: BpLoaderProps) => (
  <Box data-testid='bp-loader-wrapper' sx={{ ...LOADER_SX, ...sx }}>
    <CircularProgress sx={{ color: BP_COLOR[20] }} size={60} />
    {message && <Typography sx={{ color: 'black', ...messageSx }}>{message}</Typography>}
  </Box>
);
