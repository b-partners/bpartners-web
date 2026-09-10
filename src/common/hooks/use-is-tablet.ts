import { useMediaQuery } from '@mui/material';

export const TABLET_MAX_WIDTH = 1024;

export const useIsTablet = () => useMediaQuery(`(max-width:${TABLET_MAX_WIDTH}px)`);
