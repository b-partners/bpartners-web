import { Box, CircularProgress, Typography } from '@mui/material';
import { BP_COLOR } from '../../bp-theme';

const styles = {
  BG: {
    width: '100vw',
    height: '90vh',
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 1,
  },
};

const BPLoader = ({ sx = {}, message = '', messageSx = {} }) => (
  <Box sx={{ ...styles.BG, ...sx }}>
    <CircularProgress sx={{ color: BP_COLOR[20] }} size={60} />
    {message && <Typography sx={{ color: 'black', ...messageSx }}>{message}</Typography>}
  </Box>
);

export default BPLoader;
