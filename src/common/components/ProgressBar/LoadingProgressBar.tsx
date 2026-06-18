import { useLoadingProgress } from '@/common/hooks';
import { Box, SxProps } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { ProgressBar } from './ProgressBar';

interface LoadingProgressBarProps {
  isLoading: boolean;
  steps?: number;
  cap?: number;
  lingerMs?: number;
  sx?: SxProps;
  className?: string;
}

export const LoadingProgressBar: FC<LoadingProgressBarProps> = ({ isLoading, steps, cap, lingerMs = 900, sx, ...rest }) => {
  const progress = useLoadingProgress(isLoading, steps, cap);
  const [visible, setVisible] = useState(isLoading);
  const timeoutRef = useRef(0);

  useEffect(() => {
    if (isLoading) {
      window.clearTimeout(timeoutRef.current);
      setVisible(true);
    } else {
      timeoutRef.current = window.setTimeout(() => setVisible(false), lingerMs);
    }
    return () => window.clearTimeout(timeoutRef.current);
  }, [isLoading, lingerMs]);

  if (!visible) return null;

  return (
    <Box sx={sx} {...rest}>
      <ProgressBar value={progress} />
    </Box>
  );
};
