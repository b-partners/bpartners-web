import { useEffect, useRef, useState } from 'react';

export function useGetElementSize<T extends HTMLElement>(dependecies: any[]) {
  const ref = useRef<T>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      const { height, width } = ref.current.getBoundingClientRect();
      if (size.height === 0 || size.width === 0) setSize({ height, width });
    }
  }, [ref.current?.getBoundingClientRect(), dependecies]);

  return { ref, ...size };
}
