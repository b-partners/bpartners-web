import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import { ProgressBarStyle } from './style';

interface ProgressBarProps {
  value?: number;
  duration?: number;
}

export const ProgressBar: FC<ProgressBarProps> = ({ value, duration }) => {
  const [animated, setAnimated] = useState(0);
  const isControlled = value !== undefined;

  useEffect(() => {
    if (isControlled || !duration) return;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, Math.round((elapsed / duration) * 100));
      setAnimated(next);
      if (next < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, isControlled]);

  const percent = Math.min(100, Math.max(0, Math.round(isControlled ? (value as number) : animated)));

  return (
    <Box sx={ProgressBarStyle}>
      <Box className='bar-track'>
        <motion.div className='bar-fill' animate={{ width: `${percent}%` }} transition={{ ease: 'linear', duration: 0.2 }} />
      </Box>
      <Typography className='bar-percent'>{percent}%</Typography>
    </Box>
  );
};
