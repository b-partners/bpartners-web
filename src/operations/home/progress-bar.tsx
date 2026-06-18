import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import { progressBarStyle } from './style';

interface ProgressBarProps {
  duration: number;
}

export const ProgressBar: FC<ProgressBarProps> = ({ duration }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const value = Math.min(100, Math.round((elapsed / duration) * 100));
      setPercent(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return (
    <Box sx={progressBarStyle}>
      <Box className='bar-track'>
        <motion.div className='bar-fill' animate={{ width: `${percent}%` }} transition={{ ease: 'linear', duration: 0.2 }} />
      </Box>
      <Typography className='bar-percent'>{percent}%</Typography>
    </Box>
  );
};
