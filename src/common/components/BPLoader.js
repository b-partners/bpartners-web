import { Box, CircularProgress } from '@mui/material';
import { BP_COLOR } from '../../bp-theme';

const styles = {
  BG: { width: '100vw', height: '90vh', margin: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

const BPLoader = () => (
  <Box sx={styles.BG}>
    <CircularProgress sx={{ color: BP_COLOR[20] }} size={60} />
  </Box>
);

export default BPLoader;
