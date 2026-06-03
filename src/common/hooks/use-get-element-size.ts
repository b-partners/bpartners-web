import { useEffect, useRef, useState } from 'react';

export const useGetElementSize = <T extends HTMLElement>(_dependencies?: any[]) => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const { height, width } = element.getBoundingClientRect();
      setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [_dependencies]);

  return { ref, ...size };
};
