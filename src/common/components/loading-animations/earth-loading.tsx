import { Box } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { FC, useEffect, useRef, useState } from 'react';
import { EarthSatellitesStyle } from './style';

const CX = 150;
const CY = 150;
const ORBIT_R1 = 100;
const ORBIT_R2 = 118;
const ORBIT_R3 = 135;
const EARTH_R = 68;

interface SatelliteProps {
  x: number;
  y: number;
  size?: number;
  mounted: boolean;
  delay: number;
}

const Satellite: FC<SatelliteProps> = ({ x, y, size = 1, mounted, delay }) => {
  const controls = useAnimation();
  const originX = CX + (x - CX) * 2.5;
  const originY = CY + (y - CY) * 2.5;

  useEffect(() => {
    if (!mounted) return;
    controls.start({
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.9, delay, ease: 'easeOut' },
    });
  }, [mounted, controls, delay]);

  return (
    <motion.g animate={controls} initial={{ opacity: 0, x: originX - x, y: originY - y }}>
      <g transform={`translate(${x}, ${y}) scale(${size})`}>
        <rect x='-6' y='-4' width='12' height='8' rx='2' fill='#cfd8dc' />
        <rect x='-14' y='-2.5' width='8' height='5' rx='1' fill='#b0bec5' />
        <rect x='6' y='-2.5' width='8' height='5' rx='1' fill='#b0bec5' />
        <rect x='-1' y='-7' width='2' height='3' fill='#90a4ae' />
        <rect x='-1' y='4' width='2' height='3' fill='#90a4ae' />
        <circle cx='0' cy='0' r='1.5' fill='#4fc3f7' opacity='0.9' />
      </g>
    </motion.g>
  );
};

interface EarthSatellitesProps {
  endAnimation?: boolean;
}

export const EarthSatellites: FC<EarthSatellitesProps> = ({ endAnimation = false }) => {
  const [angle1, setAngle1] = useState(0);
  const [angle2, setAngle2] = useState(Math.PI * 0.66);
  const [angle3, setAngle3] = useState(Math.PI * 1.33);
  const [earthAngle, setEarthAngle] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  const wrapperControls = useAnimation();
  const earthControls = useAnimation();
  const orbit1Controls = useAnimation();
  const orbit2Controls = useAnimation();
  const orbit3Controls = useAnimation();

  useEffect(() => {
    const tick = (now: number) => {
      const dt = last.current ? (now - last.current) / 1000 : 0;
      last.current = now;
      setAngle1(a => a + dt * 0.55);
      setAngle2(a => a - dt * 0.38);
      setAngle3(a => a + dt * 0.28);
      setEarthAngle(a => a + dt * 0.04);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  useEffect(() => {
    const sequence = async () => {
      await earthControls.start({ opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } });
      await orbit1Controls.start({ opacity: 0.3, transition: { duration: 0.4 } });
      await orbit2Controls.start({ opacity: 0.25, transition: { duration: 0.4 } });
      await orbit3Controls.start({ opacity: 0.2, transition: { duration: 0.4 } });
      setMounted(true);
    };
    sequence();
  }, [earthControls, orbit1Controls, orbit2Controls, orbit3Controls]);

  useEffect(() => {
    if (!endAnimation) return;
    cancelAnimationFrame(raf.current);
    wrapperControls
      .start({
        scale: 1.4,
        opacity: 0,
        transition: { duration: 0.5, ease: 'easeInOut' },
      })
      .then(() => setHidden(true));
  }, [endAnimation, wrapperControls]);

  const s1x = CX + ORBIT_R1 * Math.cos(angle1);
  const s1y = CY + ORBIT_R1 * Math.sin(angle1);
  const s2x = CX + ORBIT_R2 * Math.cos(angle2);
  const s2y = CY + ORBIT_R2 * Math.sin(angle2);
  const s3x = CX + ORBIT_R3 * Math.cos(angle3);
  const s3y = CY + ORBIT_R3 * Math.sin(angle3);

  const earthDeg = (earthAngle * 180) / Math.PI;

  if (hidden) return null;

  return (
    <Box sx={EarthSatellitesStyle}>
      <motion.div className='motion-wrapper' animate={wrapperControls} initial={{ scale: 1, opacity: 1 }}>
        <svg className='svg-root' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <clipPath id='earthClip'>
              <circle cx={CX} cy={CY} r={EARTH_R} />
            </clipPath>
            <radialGradient id='atmo' cx='50%' cy='50%' r='50%'>
              <stop offset='82%' stopColor='#4fc3f7' stopOpacity='0' />
              <stop offset='100%' stopColor='#4fc3f7' stopOpacity='0.22' />
            </radialGradient>
            <radialGradient id='earthShadow' cx='80%' cy='75%' r='55%'>
              <stop offset='0%' stopColor='#000000' stopOpacity='0.35' />
              <stop offset='100%' stopColor='#000000' stopOpacity='0' />
            </radialGradient>
            <radialGradient id='earthShine' cx='35%' cy='30%' r='50%'>
              <stop offset='0%' stopColor='#ffffff' stopOpacity='0.15' />
              <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
            </radialGradient>
          </defs>

          <motion.g animate={earthControls} initial={{ opacity: 0, scale: 0.6 }} style={{ transformOrigin: `${CX}px ${CY}px` }}>
            <g clipPath='url(#earthClip)'>
              <image
                href='/loading/earth.webp'
                x={CX - EARTH_R * 2}
                y={CY - EARTH_R}
                width={EARTH_R * 4}
                height={EARTH_R * 2}
                preserveAspectRatio='xMidYMid slice'
                transform={`rotate(${earthDeg}, ${CX}, ${CY})`}
              />
            </g>
            <circle cx={CX} cy={CY} r={EARTH_R} fill='url(#earthShine)' />
            <circle cx={CX} cy={CY} r={EARTH_R} fill='url(#earthShadow)' />
            <circle cx={CX} cy={CY} r={EARTH_R + 6} fill='url(#atmo)' />
          </motion.g>

          <motion.circle
            animate={orbit1Controls}
            initial={{ opacity: 0 }}
            cx={CX}
            cy={CY}
            r={ORBIT_R1}
            fill='none'
            stroke='#cfd8dc'
            strokeWidth='0.6'
            strokeDasharray='5 4'
          />
          <motion.circle
            animate={orbit2Controls}
            initial={{ opacity: 0 }}
            cx={CX}
            cy={CY}
            r={ORBIT_R2}
            fill='none'
            stroke='#cfd8dc'
            strokeWidth='0.6'
            strokeDasharray='5 4'
          />
          <motion.circle
            animate={orbit3Controls}
            initial={{ opacity: 0 }}
            cx={CX}
            cy={CY}
            r={ORBIT_R3}
            fill='none'
            stroke='#cfd8dc'
            strokeWidth='0.6'
            strokeDasharray='5 4'
          />

          <Satellite x={s1x} y={s1y} size={1} mounted={mounted} delay={0} />
          <Satellite x={s2x} y={s2y} size={0.9} mounted={mounted} delay={0.35} />
          <Satellite x={s3x} y={s3y} size={0.85} mounted={mounted} delay={0.7} />

          <motion.line
            x1={CX}
            y1={CY}
            x2={s1x}
            y2={s1y}
            stroke='#4fc3f7'
            strokeWidth='0.8'
            strokeDasharray='3 3'
            animate={endAnimation ? { opacity: 0 } : { opacity: [0, 0.7, 0] }}
            transition={{ duration: 2, repeat: endAnimation ? 0 : Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          />
          <motion.line
            x1={CX}
            y1={CY}
            x2={s2x}
            y2={s2y}
            stroke='#4fc3f7'
            strokeWidth='0.8'
            strokeDasharray='3 3'
            animate={endAnimation ? { opacity: 0 } : { opacity: [0, 0.7, 0] }}
            transition={{ duration: 2, repeat: endAnimation ? 0 : Infinity, repeatDelay: 2, ease: 'easeInOut', delay: 1.1 }}
          />
          <motion.line
            x1={CX}
            y1={CY}
            x2={s3x}
            y2={s3y}
            stroke='#4fc3f7'
            strokeWidth='0.8'
            strokeDasharray='3 3'
            animate={endAnimation ? { opacity: 0 } : { opacity: [0, 0.7, 0] }}
            transition={{ duration: 2, repeat: endAnimation ? 0 : Infinity, repeatDelay: 2, ease: 'easeInOut', delay: 2.2 }}
          />

          <motion.circle
            cx={CX}
            cy={CY}
            r={EARTH_R}
            fill='none'
            stroke='#4fc3f7'
            strokeWidth='1.5'
            animate={endAnimation ? { opacity: 0 } : { opacity: [0, 0.35, 0], r: [EARTH_R, EARTH_R + 20, EARTH_R + 42] }}
            transition={{ duration: 3.5, repeat: endAnimation ? 0 : Infinity, ease: 'easeOut', repeatDelay: 0.3 }}
          />
        </svg>
      </motion.div>
    </Box>
  );
};
