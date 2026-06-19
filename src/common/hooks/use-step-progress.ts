import { useCallback, useEffect, useRef, useState } from 'react';

const CREEP_SPEED = 7;
const DEFAULT_CAP = 98;

export const useStepProgress = (steps: number, cap: number = DEFAULT_CAP, durationMs?: number) => {
  const [progress, setProgress] = useState(0);
  const valueRef = useRef(0);
  const targetRef = useRef(0);
  const completedRef = useRef(0);
  const runningRef = useRef(false);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const startTimeRef = useRef(0);

  const stop = useCallback(() => {
    runningRef.current = false;
    lastRef.current = 0;
    startTimeRef.current = 0;
    cancelAnimationFrame(frameRef.current);
  }, []);

  const tick = useCallback(
    (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      if (durationMs && durationMs > 0) {
        if (!startTimeRef.current) startTimeRef.current = now;
        const fraction = Math.min(1, (now - startTimeRef.current) / durationMs);
        const eased = 1 - Math.pow(1 - fraction, 2);
        valueRef.current = Math.min(cap, Math.max(valueRef.current, eased * cap));
      } else {
        const remaining = targetRef.current - valueRef.current;
        if (remaining > 0.05) {
          const decel = Math.max(0.04, (cap - valueRef.current) / cap);
          valueRef.current = Math.min(targetRef.current, valueRef.current + Math.min(remaining, CREEP_SPEED * decel * dt));
        }
      }
      setProgress(Math.round(valueRef.current));
      if (runningRef.current) frameRef.current = requestAnimationFrame(tick);
    },
    [cap, durationMs]
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastRef.current = 0;
    startTimeRef.current = 0;
    completedRef.current = 0;
    targetRef.current = cap;
    frameRef.current = requestAnimationFrame(tick);
  }, [cap, tick]);

  const advance = useCallback(() => {
    completedRef.current = Math.min(completedRef.current + 1, steps);
    valueRef.current = Math.max(valueRef.current, (completedRef.current / steps) * cap);
    targetRef.current = cap;
  }, [cap, steps]);

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
    startTimeRef.current = 0;
    setProgress(0);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { progress, start, advance, complete, reset };
};
