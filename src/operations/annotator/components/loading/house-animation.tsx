import { Box } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { FC, useEffect } from 'react';
import { ScreenShotAnimationStyle } from './style';

interface ScreenShotAnimationProps {
  roofImageSrc?: string;
  onComplete?: () => void;
}

export const ScreenShotAnimation: FC<ScreenShotAnimationProps> = ({ roofImageSrc, onComplete }) => {
  const cityControls = useAnimation();
  const flashControls = useAnimation();
  const scanControls = useAnimation();
  const photoControls = useAnimation();
  const targetControls = useAnimation();

  useEffect(() => {
    const run = async () => {
      await cityControls.start({
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
      });

      await new Promise(r => setTimeout(r, 400));

      await targetControls.start({
        opacity: 1,
        transition: { duration: 0.4 },
      });

      await new Promise(r => setTimeout(r, 400));

      await cityControls.start({
        scale: 4,
        transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] },
      });

      await new Promise(r => setTimeout(r, 150));

      await flashControls.start({
        opacity: [0, 1, 0],
        transition: { duration: 0.22 },
      });

      await scanControls.start({
        y: ['0%', '100%'],
        opacity: [0.9, 0],
        transition: { duration: 0.55, ease: 'linear' },
      });

      cityControls.start({
        opacity: 0,
        transition: { duration: 0.3 },
      });

      await new Promise(r => setTimeout(r, 150));

      await photoControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      });

      onComplete?.();
    };

    run();
  }, []);

  return (
    <Box sx={ScreenShotAnimationStyle}>
      <motion.div className='city-wrapper' animate={cityControls} initial={{ opacity: 0, scale: 1 }}>
        <img src='/loading/city.webp' alt='city' className='city-img' />

        <motion.div className='target-box' animate={targetControls} initial={{ opacity: 0 }}>
          <span className='corner tl' />
          <span className='corner tr' />
          <span className='corner bl' />
          <span className='corner br' />
        </motion.div>

        <motion.div className='flash-overlay' animate={flashControls} initial={{ opacity: 0 }} />
        <motion.div className='scan-line' animate={scanControls} initial={{ y: '0%', opacity: 0 }} />
      </motion.div>

      <motion.div className='photo-wrapper' animate={photoControls} initial={{ opacity: 0, scale: 0.75 }}>
        <div className='photo-frame'>
          <div className='photo-inner'>
            {roofImageSrc ? (
              <img src={roofImageSrc} alt='roof' className='roof-img' />
            ) : (
              <img src='/loading/city-selection.webp' alt='roof fallback' className='roof-img' />
            )}
          </div>
          <div className='skeleton-shimmer' />
          <span className='photo-corner pc-tl' />
          <span className='photo-corner pc-tr' />
          <span className='photo-corner pc-bl' />
          <span className='photo-corner pc-br' />
        </div>
      </motion.div>
    </Box>
  );
};
