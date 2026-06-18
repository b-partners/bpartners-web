import { useCallback, useEffect, useRef, useState } from 'react';

export const useStepProgress = (steps: number) => {
  const [progress, setProgress] = useState(0);
  const valueRef = useRef(0);
  const targetRef = useRef(0);
  const completedRef = useRef(0);
  const runningRef = useRef(false);
  const frameRef = useRef(0);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(frameRef.current);
  }, []);

  const tick = useCallback(() => {
    valueRef.current += (targetRef.current - valueRef.current) * 0.05;
    setProgress(Math.round(valueRef.current));
    if (runningRef.current) frameRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    completedRef.current = 0;
    targetRef.current = (1 / steps) * 100;
    frameRef.current = requestAnimationFrame(tick);
  }, [steps, tick]);

  const advance = useCallback(() => {
    completedRef.current = Math.min(completedRef.current + 1, steps);
    targetRef.current = Math.min(100, ((completedRef.current + 1) / steps) * 100);
  }, [steps]);

  const complete = useCallback(() => {
    stop();
    valueRef.current = 100;
    targetRef.current = 100;
    completedRef.current = steps;
    setProgress(100);
  }, [stop, steps]);

  const reset = useCallback(() => {
    stop();
    valueRef.current = 0;
    targetRef.current = 0;
    completedRef.current = 0;
    setProgress(0);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { progress, start, advance, complete, reset };
};
