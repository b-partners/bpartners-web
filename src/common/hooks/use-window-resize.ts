import { useEffect, useState } from 'react';

export const useWindowResize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const listener = () => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    window.addEventListener('resize', listener);
  }, []);

  return { ...size };
};
